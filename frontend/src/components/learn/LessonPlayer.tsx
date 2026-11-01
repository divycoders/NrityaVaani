"use client";

import GuruChatPanel from "@/components/guru/GuruChatPanel";

/**
 * Demonstrating Virtual Guru - Interactive 3D Lesson Player.
 *
 * Drives the 3D Guru figure frame-by-frame from verified .nvclip motion assets
 * synchronizing:
 * - 3D Skeleton and Skinned Mesh (Female / Male)
 * - Multiple Viewpoints: Front (0°), Side Profile (90°), Three-Quarter (45°), Free Orbit, Fit/Reset
 * - Multi-speed Playback: 0.5x, 0.75x, 1x
 * - Step-by-Step Navigation with Scrubber Markers
 * - Vernacular Audio Narration (Goonj Neural TTS & Web Speech fallback)
 * - Interactive Conversational Guru with Active Step Context
 * - Honest In-Production handling for lessons without mocap takes
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Compass,
  Eye,
  EyeOff,
  Globe,
  MessageSquare,
  Mic,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { MocapApi } from "@/components/three/MocapFigure";
import type { Sex } from "@/components/three/figureRig";
import { decodeClip, samplePose, type Clip } from "@/lib/motion/clip";
import { DIMS } from "@/lib/motion/poseCodec";
import {
  clipFor,
  lineAt,
  lineText,
  linesIn,
  loadManifest,
  stepAt,
  type Language,
  type LessonManifest,
  type SpokenLine,
  SUPPORTED_LANGUAGES,
} from "@/lib/lesson/manifest";
import {
  getBestPersonaForLanguage,
  getVoiceModelsForLanguage,
  getPersona,
  type GuruPersona,
  type GuruVoiceModelOption,
} from "@/lib/voice/guruPersonas";
import { GuruAudioEngine } from "@/lib/voice/guruAudioEngine";
import { CurriculumProgressService } from "@/lib/services/CurriculumProgressService";
import { getLessonBySlug } from "@/lib/curriculum/curriculumData";
import { Eyebrow, Rule } from "@/components/ui/editorial";

const MocapFigure = dynamic(() => import("@/components/three/MocapFigure"), {
  ssr: false,
  loading: () => null,
});

const SPEEDS = [0.5, 0.75, 1] as const;

function clock(t: number) {
  const s = Math.max(0, Math.floor(t));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const chip =
  "mono rounded-full border px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] uppercase tracking-[0.14em] sm:tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
const chipOn = "border-primary/70 bg-primary/10 text-primary";
const chipOff =
  "border-foreground/20 text-foreground/60 hover:border-primary/50 hover:text-primary";

const LESSON_RELATED_MUDRAS: Record<string, { slug: string; name: string }[]> = {
  namaskaram: [
    { slug: "anjali", name: "Anjali Mudra" },
    { slug: "pataka", name: "Pataka Hasta" },
    { slug: "katakamukha", name: "Katakamukha Hasta" },
    { slug: "shikhara", name: "Shikhara Hasta" },
  ],
  thattadavu: [
    { slug: "pataka", name: "Pataka Hasta" },
    { slug: "tripataka", name: "Tripataka Hasta" },
    { slug: "ardhapataka", name: "Ardhapataka Hasta" },
  ],
};

export default function LessonPlayer({
  slug,
  dance,
  part,
}: {
  slug: string;
  /** The dance this lesson is a part of, which is where "back" goes; null if unknown. */
  dance: { slug: string; name: string } | null;
  /** Its place in that dance's sequence — "Part 1" — or null if it is not published. */
  part: number | null;
}) {
  const backHref = dance ? `/learn/${dance.slug}` : "/learn";

  const [manifest, setManifest] = useState<LessonManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [line, setLine] = useState<SpokenLine | null>(null);
  const [speed, setSpeed] = useState<number>(1);
  const [loop, setLoop] = useState(false);
  const [sex, setSex] = useState<Sex>("female");
  const [lang, setLang] = useState<Language>("en");
  const [skeleton, setSkeleton] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"steps" | "guru">("steps");
  const [showExplanation, setShowExplanation] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [activeViewpoint, setActiveViewpoint] = useState<"front" | "side" | "threeQuarter" | "reset">("front");
  const [activePreset, setActivePreset] = useState<"full" | "face" | "mudras" | "feet">("full");
  const [isSpeakingExplanation, setIsSpeakingExplanation] = useState(false);

  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return CurriculumProgressService.isCompleted(slug);
  });

  // 3D Guru Voice Persona automatically calibrated to the selected language
  const [persona, setPersona] = useState<GuruPersona>(() => getBestPersonaForLanguage("en", "female"));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showGuruMenu, setShowGuruMenu] = useState(false);
  const voiceModels = useMemo(() => getVoiceModelsForLanguage(lang), [lang]);

  // Voice narration — pre-loaded Audio elements, one per spoken line.
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const audioEngineRef = useRef<GuruAudioEngine | null>(null);
  if (!audioEngineRef.current) {
    audioEngineRef.current = new GuruAudioEngine(persona.id, lang, {
      volume,
      muted,
      rate: speed,
      onSpeakingChange: (val) => setIsSpeaking(val),
      onLoadingChange: (val) => setIsLoadingAudio(val),
    });
  }

  useEffect(() => {
    audioEngineRef.current?.setPersona(persona.id);
  }, [persona]);

  useEffect(() => {
    audioEngineRef.current?.setLanguage(lang);
  }, [lang]);

  useEffect(() => {
    audioEngineRef.current?.setVolume(volume);
    audioEngineRef.current?.setMuted(muted);
    audioEngineRef.current?.setRate(speed);
  }, [volume, muted, speed]);

  const apiRef = useRef<MocapApi | null>(null);
  const clipsRef = useRef(new Map<string, Clip>());
  const manRef = useRef<LessonManifest | null>(null);
  const scrubRef = useRef<HTMLInputElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const stepRef = useRef(0);
  const lineRef = useRef(-1);
  const poseRef = useRef(new Float32Array(DIMS));

  const rafRef = useRef(0);
  const tRef = useRef(0);
  const originRef = useRef(0);
  const startedRef = useRef(0);
  const speedRef = useRef(1);
  const loopRef = useRef(false);
  const sexRef = useRef<Sex>("female");
  const langRef = useRef<Language>("en");
  speedRef.current = speed;
  loopRef.current = loop;
  sexRef.current = sex;
  langRef.current = lang;

  const volumeRef = useRef(0.8);
  const mutedRef = useRef(false);
  const activeLineTrackRef = useRef<{ start: number; lang: Language } | null>(null);
  volumeRef.current = volume;
  mutedRef.current = muted;

  /** Puts the figure, the scrubber, the step and the caption at `t`. */
  const applyTime = useCallback((t: number) => {
    const man = manRef.current;
    const clip = man && clipsRef.current.get(clipFor(man, sexRef.current));
    if (!clip || !man) return;
    tRef.current = t;

    apiRef.current?.show(samplePose(clip, t, poseRef.current));

    if (scrubRef.current) scrubRef.current.value = String(t);
    if (clockRef.current) clockRef.current.textContent = clock(t);

    const s = stepAt(man.steps, t);
    if (s !== stepRef.current) {
      stepRef.current = s;
      setStep(s);
      CurriculumProgressService.recordVisit(slug, s);
    }
    const l = lineAt(man.lines, t);
    const id = l?.start ?? -1;
    if (id !== lineRef.current) {
      lineRef.current = id;
      setLine(l);
    }
  }, [slug]);

  /** Retire whatever line is speaking. */
  const stopVoice = useCallback(() => {
    activeLineTrackRef.current = null;
    audioEngineRef.current?.stop();
    setIsSpeaking(false);
    setIsLoadingAudio(false);
    setIsSpeakingExplanation(false);
  }, []);

  /** Keep the narration on the clock. */
  const syncVoice = useCallback(
    (t: number) => {
      const man = manRef.current;
      if (!man) return;

      const l = lineAt(man.lines, t);
      if (!l) {
        if (activeLineTrackRef.current) stopVoice();
        return;
      }

      if (
        activeLineTrackRef.current &&
        activeLineTrackRef.current.start === l.start &&
        activeLineTrackRef.current.lang === langRef.current
      ) {
        return;
      }

      activeLineTrackRef.current = {
        start: l.start,
        lang: langRef.current,
      };

      const textToSpeak = lineText(l, langRef.current);
      const lineDuration = l.end - l.start;

      void audioEngineRef.current?.syncLine(
        l.start,
        lineDuration,
        textToSpeak,
        t
      );
    },
    [stopVoice],
  );

  const tick = useCallback(() => {
    const man = manRef.current;
    if (!man) return;
    let t =
      originRef.current +
      ((performance.now() - startedRef.current) / 1000) * speedRef.current;

    const s = man.steps[stepRef.current];
    const end = loopRef.current && s ? s.end : man.duration;
    const back = loopRef.current && s ? s.start : 0;
    if (t >= end) {
      if (!loopRef.current) {
        CurriculumProgressService.markCompleted(slug);
        setIsCompleted(true);
      }
      t = back;
      originRef.current = back;
      startedRef.current = performance.now();
    }

    applyTime(t);
    syncVoice(t);
    rafRef.current = requestAnimationFrame(tick);
  }, [applyTime, syncVoice, slug]);

  const play = useCallback(() => {
    if (!manRef.current) return;
    cancelAnimationFrame(rafRef.current);
    const duration = manRef.current?.duration ?? 0;
    originRef.current = tRef.current >= duration - 0.05 ? 0 : tRef.current;
    startedRef.current = performance.now();
    setPlaying(true);
    syncVoice(originRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, syncVoice]);

  const pause = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    setPlaying(false);
    stopVoice();
  }, [stopVoice]);

  /** Move the playhead without disturbing whether it is running. */
  const seek = useCallback(
    (t: number) => {
      applyTime(t);
      originRef.current = t;
      startedRef.current = performance.now();
      stopVoice();
    },
    [applyTime, stopVoice],
  );

  const prevStep = useCallback(() => {
    const man = manRef.current;
    if (!man || !man.steps.length) return;
    const curIdx = stepRef.current;
    const cur = man.steps[curIdx];
    if (tRef.current > (cur?.start ?? 0) + 1.5 && cur) {
      seek(cur.start);
    } else if (curIdx > 0) {
      seek(man.steps[curIdx - 1].start);
    } else if (cur) {
      seek(cur.start);
    }
  }, [seek]);

  const nextStep = useCallback(() => {
    const man = manRef.current;
    if (!man || !man.steps.length) return;
    const curIdx = stepRef.current;
    if (curIdx < man.steps.length - 1) {
      seek(man.steps[curIdx + 1].start);
    } else {
      seek(man.duration);
    }
  }, [seek]);

  const handleSelectLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    langRef.current = newLang;
    const best = getBestPersonaForLanguage(newLang, sexRef.current);
    setPersona(best);
    setShowLangMenu(false);
    const man = manRef.current;
    if (man) {
      audioEngineRef.current?.preloadLanguage(man.lines);
      const curLine = lineAt(man.lines, tRef.current);
      if (curLine) {
        seek(curLine.start);
      }
    }
  }, [seek]);

  const handleSelectVoiceModel = useCallback((model: GuruVoiceModelOption) => {
    const p = getPersona(model.id);
    setPersona(p);
    if (model.sex !== sexRef.current) {
      setSex(model.sex);
      sexRef.current = model.sex;
    }
    setShowGuruMenu(false);
    const man = manRef.current;
    if (man) {
      audioEngineRef.current?.preloadLanguage(man.lines);
      const curLine = lineAt(man.lines, tRef.current);
      if (curLine) {
        seek(curLine.start);
      }
    }
  }, [seek]);

  // Load the lesson and its clips together
  useEffect(() => {
    const abort = new AbortController();
    let dead = false;
    (async () => {
      try {
        const man = await loadManifest(slug, abort.signal);
        const paths = [...new Set([man.clip, ...Object.values(man.clips ?? {})])].filter(
          (p): p is string => !!p,
        );
        const pending = paths.map((path) => fetch(path, { signal: abort.signal }));
        pending.forEach((p) => p.catch(() => {}));
        const clips = new Map<string, Clip>();
        for (let i = 0; i < paths.length; i++) {
          const res = await pending[i];
          if (!res.ok) throw new Error(`Lesson clip missing (${res.status})`);
          clips.set(paths[i], await decodeClip(await res.blob()));
        }

        if (dead) return;
        manRef.current = man;
        clipsRef.current = clips;
        audioEngineRef.current?.preloadLanguage(man.lines);
        setManifest(man);
        CurriculumProgressService.recordVisit(slug);
      } catch (err) {
        if (dead || abort.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      dead = true;
      abort.abort();
      cancelAnimationFrame(rafRef.current);
    };
  }, [slug]);

  useEffect(() => {
    if (ready && manifest) applyTime(tRef.current);
  }, [sex, ready, manifest, applyTime]);

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      audioEngineRef.current?.stop();
    },
    [],
  );

  // Keyboard navigation: Space to play, arrows to scrub, [ and ] for steps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|BUTTON|SELECT)$/.test(el.tagName)) return;
      const man = manRef.current;
      if (!man) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (playing) pause();
        else play();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        seek(Math.max(0, tRef.current - 2));
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        seek(Math.min(man.duration, tRef.current + 2));
      } else if (e.code === "BracketLeft" || e.code === "KeyP") {
        e.preventDefault();
        prevStep();
      } else if (e.code === "BracketRight" || e.code === "KeyN") {
        e.preventDefault();
        nextStep();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing, play, pause, seek, prevStep, nextStep]);

  // Handle on-demand spoken explanation
  const handleToggleSpeakExplanation = () => {
    const cur = manifest?.steps[step];
    if (!cur) return;
    if (isSpeakingExplanation) {
      stopVoice();
      return;
    }
    const cuesText = cur.cues.join(". ");
    const speechText = `${cur.name}. ${cur.gloss}. Technique cues: ${cuesText}`;
    setIsSpeakingExplanation(true);
    void audioEngineRef.current?.speakAnswer(speechText, () => {
      setIsSpeakingExplanation(false);
    });
  };

  // Step 8: Handle unavailable demonstrations honestly
  if (error) {
    const curriculumLesson = getLessonBySlug(slug);

    if (curriculumLesson) {
      return (
        <div className="min-h-screen px-4 pt-28 pb-32 sm:px-6 sm:pt-36">
          <div className="mx-auto max-w-4xl">
            <Link
              href={backHref}
              className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-foreground/50 transition-colors hover:text-primary mb-6"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to {dance?.name ?? "Curriculum"}
            </Link>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <span className="mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                    Motion Demonstration In Production
                  </span>
                  <h1 className="serif text-[2rem] sm:text-[2.4rem] leading-tight text-foreground/95">
                    {curriculumLesson.title}
                  </h1>
                  <p className="serif text-[1.05rem] leading-[1.65] text-foreground/80">
                    Studio 3D motion capture for <strong>{curriculumLesson.title}</strong> is currently in production awaiting Natyacharya recording. The complete theoretical syllabus, sollukattu, and technique cues are documented below for structured study.
                  </p>
                </div>
              </div>

              <Rule className="my-6" />

              <div className="space-y-6">
                <div>
                  <Eyebrow tone="primary">Lesson Concepts & Technique Cues</Eyebrow>
                  <ul className="mt-3 space-y-2">
                    {curriculumLesson.techniqueCues.map((cue) => (
                      <li key={cue} className="serif flex gap-2 text-[0.98rem] text-foreground/80 leading-snug">
                        <span aria-hidden className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {cue}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-foreground/10 flex flex-wrap gap-3">
                  <Link
                    href="/learn/bharatanatyam/namaskaram"
                    className="mono inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-black font-semibold hover:bg-primary/85 transition-colors shadow-sm"
                  >
                    <Play className="h-3.5 w-3.5" /> Watch Namaskaram (3D Demo)
                  </Link>
                  <Link
                    href="/learn/bharatanatyam/thattadavu"
                    className="mono inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Play className="h-3.5 w-3.5" /> Watch Thattadavu (3D Demo)
                  </Link>
                  <Link
                    href="/learn/bharatanatyam"
                    className="mono inline-flex items-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-foreground/70 hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    Return to Curriculum Overview
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen px-6 pt-40 pb-32">
        <div className="mx-auto max-w-md">
          <Eyebrow>not found</Eyebrow>
          <h1 className="serif mt-4 text-[2rem] leading-tight">
            That lesson isn&rsquo;t here.
          </h1>
          <p className="serif mt-3 text-[1rem] leading-[1.6] text-foreground/60">
            {error}
          </p>
          <Link
            href={backHref}
            className="mono mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to {dance?.name ?? "all dances"}
          </Link>
        </div>
      </div>
    );
  }

  const current = manifest?.steps[step];
  const relatedMudras = LESSON_RELATED_MUDRAS[slug] ?? [];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden px-3 pt-18 pb-20 sm:px-6 sm:pt-32 sm:pb-24">
      <div className="mx-auto w-full max-w-6xl min-w-0">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href={backHref}
            className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-foreground/50 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {dance?.name ?? "All dances"}
          </Link>
          {dance && part && (
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-primary sm:hidden">
              {dance.name} · Part {part}
            </span>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:block mt-8">
          <div className="flex items-center justify-between">
            <div>
              <Eyebrow tone="primary">
                {dance && part ? `${dance.name} · Part ${part}` : "3D Guru Demonstration"}
              </Eyebrow>
              <h1 className="serif mt-3 text-[2.4rem] leading-[1.05] sm:text-[3rem]">
                {manifest?.title ?? " "}
              </h1>
              <p className="serif mt-2 text-[1.05rem] leading-[1.6] text-foreground/60">
                {manifest?.subtitle ?? "Loading the take…"}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowExplanation((v) => !v)}
                className={`${chip} ${showExplanation ? chipOn : chipOff} inline-flex items-center gap-1.5`}
                title={showExplanation ? "Hide step explanation panel" : "Show step explanation panel"}
              >
                {showExplanation ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span>{showExplanation ? "Hide Explanation" : "Show Explanation"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSubtitles((v) => !v)}
                className={`${chip} ${showSubtitles ? chipOn : chipOff} inline-flex items-center gap-1.5`}
                title={showSubtitles ? "Hide subtitles" : "Show subtitles"}
              >
                <span>{showSubtitles ? "Subtitles On" : "Subtitles Off"}</span>
              </button>
            </div>
          </div>
        </div>

        <Rule className="hidden sm:block mt-8" />

        <div className="mt-3 sm:mt-8 grid w-full min-w-0 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="w-full min-w-0 space-y-4">
            {/* 3D Studio Canvas */}
            <div className="relative h-[68vh] sm:h-auto sm:aspect-video w-full min-w-0 overflow-hidden rounded-2xl border border-card-border bg-card shadow-lg">
              <MocapFigure
                sex={sex}
                showBody
                showSkeleton={skeleton}
                showOverlayControls={false}
                className="h-full w-full"
                onReady={(api) => {
                  apiRef.current = api;
                  setReady(true);
                }}
              />

              {/* Step label overlay on canvas */}
              {current && (
                <div className="pointer-events-none absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  <p className="mono text-[10px] uppercase tracking-[0.22em] text-primary">
                    Step {step + 1} of {manifest?.steps.length}
                  </p>
                  <p className="serif mt-0.5 sm:mt-1 text-[1.05rem] sm:text-[1.2rem] font-semibold leading-tight text-foreground/95">
                    {current.name}
                  </p>
                </div>
              )}

              {/* Guru Voice Persona & Live Speaking indicator */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-2 pointer-events-auto">
                {isLoadingAudio && (
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/20 backdrop-blur-md px-2.5 py-1 border border-primary/40 shadow-sm animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-primary animate-ping"></span>
                    <span className="mono text-[9px] uppercase tracking-[0.16em] text-primary font-semibold">
                      Voice Synthesizing…
                    </span>
                  </div>
                )}
                {isSpeaking && !isLoadingAudio && (
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/25 backdrop-blur-md px-2.5 py-1 border border-primary/50 shadow-md animate-pulse">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span className="mono text-[9px] uppercase tracking-[0.16em] text-primary font-semibold">
                      {persona.name} Demonstrating
                    </span>
                  </div>
                )}
                <div
                  className="mono inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur-md px-3 py-1 border border-foreground/20 text-[10px] uppercase tracking-[0.14em] text-foreground/90 shadow-md"
                  title={`Instruction Language: ${SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.native ?? "English"} (${persona.name})`}
                >
                  <Globe className="h-3 w-3 text-primary" />
                  <span>{SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.native ?? "English"}</span>
                  <span className="opacity-40">·</span>
                  <span className="text-primary font-medium">{persona.name}</span>
                </div>
              </div>

              {/* Bottom canvas hint */}
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                <span className="mono text-[8.5px] uppercase tracking-wider text-foreground/50 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  Drag to freely orbit · Double-click to zoom
                </span>
                <span className="mono text-[8.5px] uppercase tracking-wider text-primary/80 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {speed}&times; Speed
                </span>
              </div>

              {!manifest && (
                <div className="mono absolute inset-0 grid place-items-center text-[11px] uppercase tracking-[0.16em] text-foreground/40">
                  Loading the 3D Guru demonstration&hellip;
                </div>
              )}
            </div>

            {/* Mobile Header: below 3D studio on phone devices */}
            <div className="sm:hidden mt-2 min-w-0">
              <Eyebrow tone="primary">
                {dance && part ? `${dance.name} · Part ${part}` : "3D Guru Demonstration"}
              </Eyebrow>
              <h1 className="serif mt-1 text-[1.85rem] leading-[1.1] break-words">
                {manifest?.title ?? " "}
              </h1>
              <p className="serif mt-1 text-[0.95rem] leading-[1.5] text-foreground/60 break-words">
                {manifest?.subtitle ?? "Loading the take…"}
              </p>
            </div>

            {/* Subtitles & Spoken Narration Banner */}
            {showSubtitles && (
              <div className="rounded-xl border border-card-border bg-card/60 p-3 flex items-start gap-2.5 min-h-[3.2rem]">
                <Volume2 className="h-4 w-4 text-primary shrink-0 mt-0.5 opacity-80" />
                <p className="serif text-[0.98rem] leading-[1.55] text-foreground/90 break-words">
                  {line ? lineText(line, lang) : (
                    <span className="italic text-foreground/40">Guru demonstration in progress…</span>
                  )}
                </p>
              </div>
            )}

            {/* Player Controls Bar */}
            <div className="w-full min-w-0 rounded-2xl border border-card-border bg-card p-3 sm:p-4 shadow-sm space-y-3">
              {/* Row 1: Primary Play / Navigation & Timeline Scrubber */}
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex items-center justify-between sm:justify-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => (playing ? pause() : play())}
                    disabled={!manifest || !ready}
                    aria-label={playing ? "Pause" : "Play"}
                    className="grid h-12 w-12 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-full bg-primary text-black shadow-md transition-transform active:scale-95 hover:opacity-85 disabled:opacity-30"
                  >
                    {playing ? (
                      <Pause className="h-5 w-5 sm:h-4 sm:w-4" />
                    ) : (
                      <Play className="ml-0.5 h-5 w-5 sm:h-4 sm:w-4" />
                    )}
                  </button>

                  {/* Step Jump Chips */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={!manifest || step === 0}
                      className={`${chip} ${chipOff} disabled:opacity-30`}
                      title="Previous step (or '[' key)"
                    >
                      <SkipBack className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        seek(current?.start ?? 0);
                        play();
                      }}
                      className={`${chip} ${chipOff}`}
                      title="Replay current step"
                    >
                      <RotateCcw className="h-3 w-3 mr-1 inline" />
                      Replay
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!manifest || (manifest && step >= manifest.steps.length - 1)}
                      className={`${chip} ${chipOff} disabled:opacity-30`}
                      title="Next step (or ']' key)"
                    >
                      <SkipForward className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoop((v) => !v)}
                      aria-pressed={loop}
                      className={`${chip} ${loop ? chipOn : chipOff}`}
                      title="Loop current step continuously"
                    >
                      <Repeat className="h-3 w-3 mr-1 inline" />
                      Loop
                    </button>
                  </div>
                </div>

                {/* Scrubber slider */}
                <div className="flex flex-1 items-center gap-2 w-full min-w-0">
                  <span
                    ref={clockRef}
                    className="mono w-9 shrink-0 text-[11px] text-foreground/60"
                  >
                    0:00
                  </span>

                  <div className="relative flex-1 min-w-0">
                    <input
                      ref={scrubRef}
                      type="range"
                      min={0}
                      max={manifest?.duration ?? 1}
                      step={0.01}
                      defaultValue={0}
                      disabled={!manifest}
                      aria-label="Position in the lesson"
                      onChange={(e) => seek(Number(e.target.value))}
                      className="w-full h-2 accent-primary cursor-pointer"
                    />
                    {manifest?.steps.slice(1).map((s) => (
                      <span
                        key={s.start}
                        aria-hidden
                        className="pointer-events-none absolute top-0 h-2 w-px bg-foreground/30"
                        style={{ left: `${(s.start / manifest.duration) * 100}%` }}
                      />
                    ))}
                  </div>

                  <span className="mono w-9 shrink-0 text-right text-[11px] text-foreground/40">
                    {clock(manifest?.duration ?? 0)}
                  </span>
                </div>
              </div>

              {/* Row 2: Multiple Viewpoints Toolbar (Step 4) */}
              <div className="pt-2 border-t border-foreground/8 flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-1 rounded-full border border-foreground/15 bg-background/50 p-1">
                  <span className="mono text-[9px] uppercase tracking-[0.14em] text-foreground/50 px-2 select-none flex items-center gap-1">
                    <Compass className="h-3 w-3 text-primary" /> Viewpoint:
                  </span>
                  {(["front", "side", "threeQuarter", "reset"] as const).map((vp) => (
                    <button
                      key={vp}
                      type="button"
                      onClick={() => {
                        setActiveViewpoint(vp);
                        apiRef.current?.setViewpoint(vp);
                      }}
                      className={`rounded-full px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider transition-colors ${
                        activeViewpoint === vp
                          ? "bg-primary text-black font-semibold shadow-sm"
                          : "text-foreground/70 hover:bg-white/10 hover:text-foreground"
                      }`}
                      title={
                        vp === "front"
                          ? "Front View (0°)"
                          : vp === "side"
                          ? "Side Profile View (90°) - Inspect knee bend and vertical posture"
                          : vp === "threeQuarter"
                          ? "3/4 Perspective View (45°) - Isometric stance geometry"
                          : "Reset View to standard framing"
                      }
                    >
                      {vp === "front" && "Front"}
                      {vp === "side" && "Side Profile"}
                      {vp === "threeQuarter" && "3/4 View"}
                      {vp === "reset" && "Reset"}
                    </button>
                  ))}
                </div>

                <span aria-hidden className="mx-1 hidden sm:inline h-4 w-px bg-foreground/15" />

                {/* Anatomical Zoom Presets */}
                <div className="flex items-center gap-1 rounded-full border border-foreground/12 bg-background/40 p-0.5">
                  <span className="mono text-[8.5px] uppercase tracking-[0.14em] text-foreground/45 px-2 select-none">
                    Zoom:
                  </span>
                  {(["full", "face", "mudras", "feet"] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setActivePreset(preset);
                        apiRef.current?.focusPreset(preset);
                      }}
                      className={`rounded-full px-2 py-0.5 text-[9px] uppercase font-mono tracking-wider transition-colors ${
                        activePreset === preset
                          ? "bg-foreground/20 text-foreground font-semibold"
                          : "text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <span aria-hidden className="mx-1 hidden sm:inline h-4 w-px bg-foreground/15" />

                {/* Playback Speeds: 0.5x, 0.75x, 1x (Step 3) */}
                <div className="flex items-center gap-1">
                  <span className="mono text-[9px] uppercase tracking-wider text-foreground/45 ml-1">Speed:</span>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeed(s)}
                      aria-pressed={speed === s}
                      className={`${chip} ${speed === s ? chipOn : chipOff} px-2.5 py-1 text-[9px]`}
                      title={`Playback speed ${s}x`}
                    >
                      {s}&times;
                    </button>
                  ))}
                </div>

                <span aria-hidden className="mx-1 hidden sm:inline h-4 w-px bg-foreground/15" />

                {/* Full Sequence Play button */}
                <button
                  type="button"
                  onClick={() => {
                    setLoop(false);
                    seek(0);
                    play();
                  }}
                  className={`${chip} ${chipOff} text-[9px]`}
                  title="Play complete continuous choreography from the beginning"
                >
                  Full Sequence
                </button>
              </div>

              {/* Row 3: Language, Voice Persona, Model & Audio Controls */}
              <div className="pt-2 border-t border-foreground/8 flex flex-wrap items-center gap-2">
                {/* Multi-Language Dropdown */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLangMenu((v) => !v);
                      setShowGuruMenu(false);
                    }}
                    className={`${chip} ${lang !== "en" ? chipOn : chipOff} inline-flex items-center gap-1.5`}
                    title="Change Guru Language & Vernacular"
                  >
                    <Globe className="h-3 w-3 text-primary" />
                    <span>{SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.native ?? "English"}</span>
                    <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                  </button>

                  {showLangMenu && (
                    <div className="absolute left-0 bottom-full mb-2 z-50 w-64 max-h-72 overflow-y-auto rounded-xl border border-card-border bg-card/95 backdrop-blur-md p-1.5 shadow-xl">
                      <p className="mono px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-foreground/40 border-b border-foreground/10 mb-1">
                        Select Language (भाषा)
                      </p>
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => handleSelectLanguage(l.code)}
                          className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                            lang === l.code
                              ? "bg-primary/15 text-primary font-medium"
                              : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
                          }`}
                        >
                          <div>
                            <div className="font-medium leading-tight">{l.native}</div>
                            <div className="mono text-[9px] text-foreground/50">{l.label} · {l.region}</div>
                          </div>
                          {lang === l.code && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Guru Voice Persona Dropdown */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGuruMenu((v) => !v);
                      setShowLangMenu(false);
                    }}
                    className={`${chip} ${showGuruMenu ? chipOn : chipOff} inline-flex items-center gap-1.5`}
                    title="Select Guru Voice Model for this language"
                  >
                    <Mic className="h-3 w-3 text-primary shrink-0" />
                    <span className="font-medium">{persona.name}</span>
                    <span className="hidden sm:inline opacity-60 text-[9px]">({persona.badge})</span>
                    <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
                  </button>

                  {showGuruMenu && (
                    <div className="absolute left-0 bottom-full mb-2 z-50 w-72 sm:w-84 max-h-80 overflow-y-auto rounded-xl border border-card-border bg-card/95 backdrop-blur-md p-2 shadow-2xl">
                      <div className="px-2 py-1 border-b border-foreground/10 mb-1.5 flex items-center justify-between">
                        <p className="mono text-[9px] uppercase tracking-[0.18em] text-foreground/50">
                          Guru Voice Models ({voiceModels.length})
                        </p>
                        <span className="mono text-[8px] uppercase tracking-wider text-primary font-medium">
                          {SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.label ?? lang}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {voiceModels.map((vm) => {
                          const isSelected = persona.id === vm.id;
                          return (
                            <button
                              key={vm.id}
                              type="button"
                              onClick={() => handleSelectVoiceModel(vm)}
                              className={`w-full flex flex-col items-start rounded-lg p-2 text-left transition-colors ${
                                isSelected
                                  ? "bg-primary/15 border border-primary/40 shadow-sm"
                                  : "text-foreground/80 hover:bg-foreground/5 hover:text-foreground border border-transparent"
                              }`}
                            >
                              <div className="w-full flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                                    {vm.name}
                                  </span>
                                  <span className="mono text-[9px] px-1.5 py-0.5 rounded-full bg-foreground/10 text-foreground/70">
                                    {vm.badge}
                                  </span>
                                  <span className="mono text-[9px] text-foreground/50">
                                    {vm.sex === "female" ? "♀" : "♂"}
                                  </span>
                                </div>
                                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                              </div>
                              <p className="text-[11px] leading-tight text-foreground/80 mt-1">
                                <span className="text-primary font-medium">Best for: </span>
                                {vm.bestFor}
                              </p>
                              <p className="text-[10px] text-foreground/50 leading-tight mt-0.5 italic">
                                {vm.tone}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Figure Sex Toggles */}
                {(["female", "male"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSex(s);
                      sexRef.current = s;
                      const best = getBestPersonaForLanguage(langRef.current, s);
                      setPersona(best);

                      const man = manRef.current;
                      if (man) {
                        const curLine = lineAt(man.lines, tRef.current);
                        if (curLine) {
                          seek(curLine.start);
                        }
                      }
                    }}
                    aria-pressed={sex === s}
                    className={`${chip} ${sex === s ? chipOn : chipOff}`}
                  >
                    {s === "female" ? "Woman" : "Man"}
                  </button>
                ))}

                {/* Skeleton Bones Overlay Toggle */}
                <button
                  type="button"
                  onClick={() => setSkeleton((v) => !v)}
                  aria-pressed={skeleton}
                  className={`${chip} ${skeleton ? chipOn : chipOff}`}
                  title="Toggle anatomical skeleton lines"
                >
                  Bones
                </button>

                {/* Audio Volume & Mute */}
                <button
                  type="button"
                  onClick={() => setMuted((v) => !v)}
                  disabled={!manifest?.voice}
                  aria-pressed={muted}
                  aria-label={muted ? "Unmute narration" : "Mute narration"}
                  className={`${chip} ${muted ? chipOn : chipOff} disabled:opacity-40`}
                >
                  {muted ? (
                    <VolumeX className="mr-1.5 inline h-3 w-3" />
                  ) : (
                    <Volume2 className="mr-1.5 inline h-3 w-3" />
                  )}
                  {muted ? "Muted" : "Voice"}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  disabled={!manifest?.voice}
                  aria-label="Narration volume"
                  title="Narration volume"
                  className="h-1 w-20 cursor-pointer accent-primary disabled:opacity-40"
                />
              </div>
            </div>

            {/* Active Step Explanation Panel (Step 5 & 7) */}
            {current && showExplanation && (
              <div className="rounded-2xl border border-card-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-foreground/10">
                  <div className="flex items-center gap-2">
                    <span className="mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                      Step {step + 1} of {manifest?.steps.length}
                    </span>
                    <h3 className="serif text-[1.2rem] font-semibold text-foreground/95">
                      {current.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Listen on demand button */}
                    <button
                      type="button"
                      onClick={handleToggleSpeakExplanation}
                      className={`mono inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                        isSpeakingExplanation
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                          : "bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20"
                      }`}
                      title="Listen to this step's explanation without video"
                    >
                      {isSpeakingExplanation ? (
                        <>
                          <VolumeX className="h-3 w-3" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3" />
                          <span>Listen Explanation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="serif text-[1rem] leading-[1.65] text-foreground/85">
                  {current.gloss}
                </p>

                {/* Technique Cues list */}
                <div>
                  <p className="mono text-[9px] uppercase tracking-[0.16em] text-foreground/50 mb-2">
                    Alignment & Technique Cues:
                  </p>
                  <ul className="space-y-1.5">
                    {current.cues.map((cue) => (
                      <li key={cue} className="serif flex gap-2 text-[0.95rem] leading-[1.5] text-foreground/80">
                        <span aria-hidden className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {cue}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Related Mudra Links */}
                {relatedMudras.length > 0 && (
                  <div className="pt-3 border-t border-foreground/10">
                    <p className="mono text-[9px] uppercase tracking-[0.16em] text-foreground/50 mb-2">
                      Related Mudras (3D Library):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {relatedMudras.map((m) => (
                        <Link
                          key={m.slug}
                          href={`/library/${m.slug}`}
                          className="mono inline-flex items-center gap-1 text-[9.5px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-foreground/5 hover:bg-primary/15 hover:text-primary transition-colors text-foreground/75 border border-foreground/12"
                        >
                          <BookOpen className="h-2.5 w-2.5 text-primary" />
                          <span>{m.name}</span>
                          <ArrowRight className="h-2.5 w-2.5 ml-0.5 opacity-60" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Sidebar (Steps List or Ask the Guru) */}
          <aside className="space-y-4">
            {/* Sidebar View Switcher: Steps vs Ask Virtual Guru */}
            <div className="flex items-center rounded-xl border border-foreground/15 bg-background/50 p-1 mb-2">
              <button
                type="button"
                onClick={() => setSidebarTab("steps")}
                className={`flex-1 mono text-[10px] uppercase tracking-wider py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  sidebarTab === "steps"
                    ? "bg-foreground/15 text-foreground font-semibold shadow-xs"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                <BookOpen className="h-3 w-3" /> Steps & Cues
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab("guru")}
                className={`flex-1 mono text-[10px] uppercase tracking-wider py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  sidebarTab === "guru"
                    ? "bg-primary text-black font-semibold shadow-xs"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-3 w-3" /> Ask the Guru
              </button>
            </div>

            {sidebarTab === "guru" ? (
              <div className="h-[740px] flex flex-col">
                <GuruChatPanel
                  currentLessonSlug={slug}
                  currentLessonTitle={manifest?.title}
                  currentStepIndex={step}
                  currentStepName={current?.name}
                  currentStepGloss={current?.gloss}
                  currentStepCues={current?.cues}
                  personaId={persona.id}
                  lang={lang}
                  audioEngine={audioEngineRef.current}
                  className="h-full"
                />
              </div>
            ) : (
              <div>
                {/* Lesson Objectives */}
                <div className="rounded-2xl border border-card-border bg-card p-4 shadow-sm mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <Eyebrow tone="primary">Lesson Objectives</Eyebrow>
                  </div>
                  <p className="serif mt-2 text-[0.96rem] leading-[1.55] text-foreground/80">
                    {slug === "namaskaram"
                      ? "Master the sacred 11-step salutation, grounded Aramandi stability, and Anjali mudra alignment with precise Adi Tala rhythm."
                      : slug === "thattadavu"
                      ? "Build foundational footwork rhythm: flat-foot striking (tattu) in Aramandi posture across three tempos (Kalam)."
                      : manifest?.subtitle ?? "Learn foundational movement sequence."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="mono text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/60 border border-foreground/10">
                      {manifest?.steps.length ?? 0} Steps
                    </span>
                    <span className="mono text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/60 border border-foreground/10">
                      {clock(manifest?.duration ?? 0)} Duration
                    </span>
                    <span className="mono text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/60 border border-foreground/10">
                      3D Guru Demonstrated
                    </span>
                  </div>
                </div>

                {/* Lesson Completion Card when on last step */}
                {manifest && step === manifest.steps.length - 1 && (
                  <div className="rounded-2xl border border-primary/40 bg-primary/[0.06] p-4 shadow-md mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <Eyebrow tone="primary">Lesson Completed</Eyebrow>
                    </div>
                    <h4 className="serif text-[1.15rem] leading-tight text-foreground/95 mt-1.5">
                      Well Danced!
                    </h4>
                    <p className="serif text-[0.92rem] leading-snug text-foreground/70 mt-1">
                      You have danced through all {manifest.steps.length} steps of {manifest.title}. Replay to solidify your posture or proceed to the next lesson.
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isCompleted) {
                            CurriculumProgressService.unmarkCompleted(slug);
                            setIsCompleted(false);
                          } else {
                            CurriculumProgressService.markCompleted(slug);
                            setIsCompleted(true);
                          }
                        }}
                        className={`mono inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.16em] font-semibold transition-colors shadow-sm ${
                          isCompleted
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-primary text-black hover:bg-primary/85"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {isCompleted ? "Marked Complete (Click to Reset)" : "Mark Lesson Complete"}
                      </button>
                      {part === 1 ? (
                        <Link
                          href={`/learn/${dance?.slug ?? "bharatanatyam"}/thattadavu`}
                          className="mono inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-black font-semibold hover:bg-primary/85 transition-colors shadow-sm"
                        >
                          Next: Part 2 (Thattadavu)
                        </Link>
                      ) : part === 2 ? (
                        <Link
                          href={`/learn/${dance?.slug ?? "bharatanatyam"}/adi-tala-and-rhythm`}
                          className="mono inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-black font-semibold hover:bg-primary/85 transition-colors shadow-sm"
                        >
                          Next: Level 4 (Adi Tala & Rhythm)
                        </Link>
                      ) : (
                        <Link
                          href={`/learn/${dance?.slug ?? "bharatanatyam"}`}
                          className="mono inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-black font-semibold hover:bg-primary/85 transition-colors shadow-sm"
                        >
                          View All Curriculum Levels
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          seek(0);
                          play();
                        }}
                        className="mono inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-foreground/80 hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Replay From Start
                      </button>
                    </div>
                  </div>
                )}

                {/* Step List navigation */}
                <Eyebrow>the steps</Eyebrow>
                <ol className="mt-3 space-y-1">
                  {manifest?.steps.map((s, i) => (
                    <li key={s.start}>
                      <button
                        type="button"
                        onClick={() => {
                          seek(s.start);
                        }}
                        aria-current={i === step ? "step" : undefined}
                        className={`w-full rounded-lg px-3 py-2 text-left transition-colors flex items-center justify-between ${
                          i === step
                            ? "bg-primary/15 border-l-2 border-primary text-foreground font-medium"
                            : "hover:bg-foreground/5 text-foreground/75"
                        }`}
                      >
                        <span className="flex items-baseline gap-2">
                          <span
                            className={`mono text-[10px] tabular-nums ${
                              i === step ? "text-primary font-bold" : "text-foreground/35"
                            }`}
                          >
                            {clock(s.start)}
                          </span>
                          <span
                            className={`serif text-[0.98rem] leading-tight ${
                              i === step ? "text-foreground font-semibold" : "text-foreground/70"
                            }`}
                          >
                            {s.name}
                          </span>
                        </span>

                        {i === step && (
                          <span className="mono text-[8px] uppercase tracking-wider text-primary px-1.5 py-0.5 rounded bg-primary/10">
                            Current
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ol>

                {/* Everything she says during this step */}
                {manifest && current && (
                  <div className="mt-6 rounded-2xl border border-card-border bg-card p-4">
                    <Eyebrow>in her words (audio lines)</Eyebrow>
                    <ul className="mt-3 space-y-1.5">
                      {linesIn(manifest.lines, current).map((l) => (
                        <li key={l.start}>
                          <button
                            type="button"
                            onClick={() => seek(l.start)}
                            className={`serif w-full rounded-md px-2.5 py-1.5 text-left text-[0.92rem] leading-[1.45] transition-colors ${
                              l.start === line?.start
                                ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                                : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground/80"
                            }`}
                          >
                            {lineText(l, lang)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
