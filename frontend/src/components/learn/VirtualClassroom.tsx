"use client";

/**
 * VirtualClassroom — Voice-Led 3D Virtual Classroom for NrityaVaani.
 *
 * The 3D Virtual Guru is the primary teacher.
 * Teaches every lesson through:
 * 1. Structured Voice Narration (Goonj Neural TTS & Vernacular Speech)
 * 2. Visual Explanations & 3D Movement Demonstrations
 * 3. 8-Chapter Pedagogy Sequence (Intro, Foundation, Demo, Details, Safety, Recap, Quiz, Next)
 * 4. Progressive Text Disclosure (Short summaries, expandable deep shastra notes)
 * 5. Interactive Formative Understanding Check
 * 6. Dynamic Lesson-Grounded Conversational Guru Assistance
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  HelpCircle,
  Loader2,
  MessageSquare,
  Mic,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Subtitles,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";

import type { MocapApi } from "@/components/three/MocapFigure";
import type { Sex } from "@/components/three/figureRig";
import { decodeClip, samplePose, type Clip } from "@/lib/motion/clip";
import {
  clipFor,
  lineAt,
  lineText,
  loadManifest,
  stepAt,
  type Language,
  type LessonManifest,
  type LessonStep,
  type SpokenLine,
} from "@/lib/lesson/manifest";
import {
  getBestPersonaForLanguage,
  getPersona,
  type GuruPersona,
} from "@/lib/voice/guruPersonas";
import { GuruAudioEngine } from "@/lib/voice/guruAudioEngine";
import {
  INDIAN_REGIONAL_LANGUAGES,
  getLanguageConfig,
  isVoiceSupported,
} from "@/lib/guru/languageCatalog";
import {
  getLessonBySlug,
  type CurriculumLesson,
} from "@/lib/curriculum/curriculumData";
import {
  getChaptersForLesson,
  getChapterVoiceScript,
} from "@/lib/curriculum/lessonChapters";
import { getLessonProvenance } from "@/lib/curriculum/provenance";
import { CurriculumProgressService } from "@/lib/services/CurriculumProgressService";
import GuruChatPanel from "@/components/guru/GuruChatPanel";
import NrittaNrityaVisualizer from "./visualizers/NrittaNrityaVisualizer";
import AdiTalaVisualizer from "./visualizers/AdiTalaVisualizer";
import PostureAlignmentVisualizer from "./visualizers/PostureAlignmentVisualizer";

// Dynamic Three.js figures to prevent SSR hydration errors
const MocapFigure = dynamic(() => import("@/components/three/MocapFigure"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-black/40">
      <span className="mono text-[11px] uppercase tracking-[0.16em] text-foreground/45 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading 3D Guru Motion Rig…
      </span>
    </div>
  ),
});

const NamasteFigure = dynamic(() => import("@/components/three/NamasteFigure"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-black/40">
      <span className="mono text-[11px] uppercase tracking-[0.16em] text-foreground/45 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading 3D Posture Model…
      </span>
    </div>
  ),
});

const NARRATION_SPEEDS = [0.5, 0.75, 1.0] as const;

function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export interface VirtualClassroomProps {
  lessonSlug: string;
  dance?: { slug: string; name: string } | null;
  part?: number | null;
  initialLang?: string;
}

export default function VirtualClassroom({
  lessonSlug,
  dance: _dance = { slug: "bharatanatyam", name: "Bharatanatyam" },
  part: _part = null,
  initialLang = "en",
}: VirtualClassroomProps) {
  // Resolve curriculum metadata
  const currLesson = useMemo(() => {
    const found = getLessonBySlug(lessonSlug);
    if (found) return found;
    // Fallback for lessons without curriculum entry
    return {
      id: lessonSlug,
      slug: lessonSlug,
      level: 1,
      levelName: "Foundations",
      title: lessonSlug.charAt(0).toUpperCase() + lessonSlug.slice(1).replace(/-/g, " "),
      subtitle: "Authentic Bharatanatyam Movement Practice",
      description: "Classical Bharatanatyam learning module guided by the 3D Virtual Guru.",
      durationMinutes: 15,
      prerequisites: [],
      type: "interactive-3d-motion" as const,
      status: "available" as const,
      hasMotionClip: true,
      objectives: ["Master foundational body alignment and discipline"],
      keyConcepts: [],
      guruNote: "Practice in Aramandi with steady breath and focused gaze.",
      techniqueCues: ["Keep spine erect", "Ground through the tripod of the feet"],
      commonMistakes: [],
      needsGuruReview: false,
    } as CurriculumLesson;
  }, [lessonSlug]);

  const provenance = useMemo(() => {
    return currLesson.provenance || getLessonProvenance(lessonSlug);
  }, [currLesson, lessonSlug]);

  // Language & Mentor state
  const [selectedLang, setSelectedLang] = useState<string>(initialLang);
  const [mentorGender, setMentorGender] = useState<Sex>("female");
  const langConfig = getLanguageConfig(selectedLang);

  // Chapters & Pedagogy state
  const chapters = useMemo(() => {
    return getChaptersForLesson(currLesson, selectedLang);
  }, [currLesson, selectedLang]);

  const initialProgress = useMemo(() => {
    if (typeof window === "undefined") return { currentChapter: 0, maxChapterReached: 0, quizAnswered: false };
    return CurriculumProgressService.getChapterProgress(lessonSlug);
  }, [lessonSlug]);

  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(initialProgress.currentChapter);
  const [maxChapterReached, setMaxChapterReached] = useState<number>(initialProgress.maxChapterReached);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(initialProgress.quizAnswered);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);

  const activeChapter = chapters[currentChapterIndex] || chapters[0];

  // Narration & Audio state
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [isNarrationLoading, setIsNarrationLoading] = useState<boolean>(false);
  const [narrationSpeed, setNarrationSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);

  // Progressive disclosure accordion
  const [notesExpanded, setNotesExpanded] = useState<boolean>(false);
  // Chat drawer state
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);

  // Lesson completion state
  const [isLessonCompleted, setIsLessonCompleted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return CurriculumProgressService.isCompleted(lessonSlug);
  });

  // Audio Engine instance
  const audioEngineRef = useRef<GuruAudioEngine | null>(null);

  // Initialize Guru Audio Engine
  useEffect(() => {
    const defaultPersona = mentorGender === "female" ? "hi_meera" : "hi_arjun";
    const bestPersona = getBestPersonaForLanguage(selectedLang as Language, mentorGender) || getPersona(defaultPersona);

    const engine = new GuruAudioEngine(bestPersona.id, selectedLang as Language, {
      volume,
      muted: isMuted,
      rate: narrationSpeed,
      onSpeakingChange: (speaking) => setIsNarrating(speaking),
      onLoadingChange: (loading) => setIsNarrationLoading(loading),
    });

    audioEngineRef.current = engine;

    return () => {
      engine.stop();
    };
  }, [selectedLang, mentorGender]);

  // Sync volume / muted / rate with audio engine
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setVolume(volume);
      audioEngineRef.current.setMuted(isMuted);
      audioEngineRef.current.setRate(narrationSpeed);
    }
  }, [volume, isMuted, narrationSpeed]);

  // Motion Assets (.nvclip) state for lessons with studio mocap takes
  const [manifest, setManifest] = useState<LessonManifest | null>(null);
  const [_manifestError, setManifestError] = useState<string | null>(null);
  const [clip, setClip] = useState<Clip | null>(null);
  const [isMocapPlaying, setIsMocapPlaying] = useState<boolean>(false);
  const [mocapTime, setMocapTime] = useState<number>(0);
  const [mocapStepIndex, setMocapStepIndex] = useState<number>(0);
  const [mocapSpeed, setMocapSpeed] = useState<number>(1.0);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showBody, setShowBody] = useState<boolean>(true);

  const mocapApiRef = useRef<MocapApi | null>(null);
  const poseBufferRef = useRef<Float32Array>(new Float32Array(256));
  const rafRef = useRef<number | null>(null);
  const lastRafTimeRef = useRef<number>(0);
  const mocapTimeRef = useRef<number>(0);

  // Load .nvclip manifest if lesson is mocap-supported (e.g. namaskaram, thattadavu)
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function fetchManifest() {
      try {
        const man = await loadManifest(lessonSlug, controller.signal);
        if (!active) return;
        setManifest(man);

        // Fetch .nvclip motion buffer
        const clipUrl = clipFor(man, mentorGender);
        const clipRes = await fetch(clipUrl, { signal: controller.signal });
        if (!clipRes.ok) throw new Error(`Could not load motion asset ${clipUrl}`);
        const clipBlob = await clipRes.blob();
        if (!active) return;
        const decoded = await decodeClip(clipBlob);
        setClip(decoded);
      } catch (err: unknown) {
        if (!active || (err instanceof Error && err.name === "AbortError")) return;
        setManifest(null);
        setClip(null);
        setManifestError(err instanceof Error ? err.message : "No motion take published for this module");
      }
    }

    void fetchManifest();

    return () => {
      active = false;
      controller.abort();
    };
  }, [lessonSlug, mentorGender]);

  // 3D Mocap playback frame loop
  const updateMocapPose = useCallback(
    (time: number) => {
      if (!clip || !mocapApiRef.current) return;
      mocapTimeRef.current = time;
      setMocapTime(time);

      const sampled = samplePose(clip, time, poseBufferRef.current);
      mocapApiRef.current.show(sampled);

      if (manifest?.steps) {
        const sIdx = stepAt(manifest.steps, time);
        setMocapStepIndex(sIdx);
      }
    },
    [clip, manifest]
  );

  const loopMocap = useCallback(
    (now: number) => {
      if (!clip) return;
      if (lastRafTimeRef.current === 0) lastRafTimeRef.current = now;
      const deltaSec = ((now - lastRafTimeRef.current) / 1000) * mocapSpeed;
      lastRafTimeRef.current = now;

      let nextTime = mocapTimeRef.current + deltaSec;
      if (nextTime >= clip.meta.duration) {
        nextTime = 0; // loop motion
      }

      updateMocapPose(nextTime);
      rafRef.current = requestAnimationFrame(loopMocap);
    },
    [clip, mocapSpeed, updateMocapPose]
  );

  useEffect(() => {
    if (isMocapPlaying) {
      lastRafTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(loopMocap);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMocapPlaying, loopMocap]);

  const toggleMocapPlayback = () => {
    setIsMocapPlaying((prev) => !prev);
  };

  const seekMocapStep = (stepIdx: number) => {
    if (!manifest?.steps || !manifest.steps[stepIdx]) return;
    const targetTime = manifest.steps[stepIdx].start;
    updateMocapPose(targetTime);
  };

  // Narration playback logic
  const handleToggleNarration = async () => {
    if (isNarrating) {
      audioEngineRef.current?.stop();
      setIsNarrating(false);
      return;
    }

    if (!audioEngineRef.current) return;

    // Get localized script for active chapter
    const script = getChapterVoiceScript(activeChapter, selectedLang);

    // Stop all other audio to enforce zero audio overlap
    GuruAudioEngine.stopAllAudio();

    try {
      await audioEngineRef.current.speakAnswer(script, () => {
        setIsNarrating(false);
      });
    } catch {
      setIsNarrating(false);
    }
  };

  const handleReplayNarration = async () => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
    }
    setIsNarrating(false);
    await handleToggleNarration();
  };

  // Navigate chapters
  const goToChapter = (index: number) => {
    if (index < 0 || index >= chapters.length) return;

    // Stop current narration on chapter jump (no autoplay on chapter change)
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
    }
    setIsNarrating(false);

    setCurrentChapterIndex(index);
    const newMax = Math.max(maxChapterReached, index);
    setMaxChapterReached(newMax);

    // Persist progress
    CurriculumProgressService.recordChapter(lessonSlug, index);
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      goToChapter(currentChapterIndex + 1);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      goToChapter(currentChapterIndex - 1);
    }
  };

  // Formative Quiz answering
  const handleSelectQuizOption = (optIdx: number) => {
    setQuizSelectedOption(optIdx);
    setQuizAnswered(true);
    CurriculumProgressService.recordQuizAnswered(lessonSlug);
  };

  // Mark lesson completed
  const handleToggleLessonComplete = () => {
    if (isLessonCompleted) {
      CurriculumProgressService.unmarkCompleted(lessonSlug);
      setIsLessonCompleted(false);
    } else {
      CurriculumProgressService.markCompleted(lessonSlug);
      setIsLessonCompleted(true);
    }
  };

  const currentStep = manifest?.steps?.[mocapStepIndex];

  return (
    <div className="min-h-screen w-full bg-background text-foreground px-3 pt-24 pb-24 sm:px-6 sm:pt-28">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        {/* Navigation Breadcrumb & Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/learn/bharatanatyam"
              className="mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-foreground/50 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Bharatanatyam Curriculum
            </Link>
            <span className="text-foreground/20">/</span>
            <span className="mono text-[10px] uppercase tracking-wider text-primary font-semibold">
              {currLesson.levelName}
            </span>
          </div>

          {/* Quick controls: Language & Mentor gender */}
          <div className="flex items-center gap-2">
            {/* Gender Toggle */}
            <button
              type="button"
              onClick={() => setMentorGender((g) => (g === "female" ? "male" : "female"))}
              className="mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-foreground/5 hover:bg-foreground/10 border border-foreground/15 text-foreground/80 flex items-center gap-1.5 transition-colors cursor-pointer"
              title={`Switch 3D Guru to ${mentorGender === "female" ? "Male Natyacharya" : "Female Guru"}`}
            >
              <User className="h-3 w-3 text-primary" />
              <span>{mentorGender === "female" ? "Female Guru" : "Male Guru"}</span>
            </button>

            {/* Regional Language Selector */}
            <div className="relative inline-flex items-center">
              <Globe className="h-3 w-3 text-primary absolute left-2 pointer-events-none" />
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="mono text-[10px] appearance-none pl-6 pr-6 py-1 rounded-full bg-foreground/5 hover:bg-foreground/10 border border-foreground/15 text-foreground/90 font-medium focus:outline-none focus:border-primary/50 cursor-pointer"
                aria-label="Select voice and instruction language"
              >
                {INDIAN_REGIONAL_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-background text-foreground">
                    {l.nativeName} ({l.name}) {l.voiceSupport ? "" : "· Text"}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-2.5 w-2.5 text-foreground/40 absolute right-2 pointer-events-none" />
            </div>

            {/* Toggle Completion */}
            <button
              type="button"
              onClick={handleToggleLessonComplete}
              className={`mono text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                isLessonCompleted
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : "bg-foreground/5 border-foreground/15 text-foreground/60 hover:text-foreground"
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>{isLessonCompleted ? "Lesson Completed" : "Mark Complete"}</span>
            </button>
          </div>
        </div>

        {/* Lesson Title Banner */}
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Voice-Led 3D Virtual Classroom
              </span>
              <span className="serif text-xs text-foreground/50">
                {currLesson.durationMinutes} min session
              </span>
              {provenance && (
                <span
                  className={`mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                    provenance.validationStatus === "source-supported"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {provenance.validationStatus === "source-supported"
                    ? "Source-Supported · Shastric Grounding"
                    : "Living Practice · Parampara"}
                </span>
              )}
            </div>
            <h1 className="serif text-2xl sm:text-3xl font-bold text-foreground">
              {currLesson.title}
            </h1>
            <p className="serif text-sm text-foreground/60 mt-0.5">
              {currLesson.subtitle}
            </p>
          </div>

          {/* Chapter Progress Indicator */}
          <div className="text-right">
            <span className="mono text-[10px] uppercase tracking-wider text-foreground/50 block">
              Teaching Sequence
            </span>
            <span className="mono text-xs font-semibold text-primary">
              Chapter {currentChapterIndex + 1} of {chapters.length} · {activeChapter.shortTitle}
            </span>
          </div>
        </div>

        {/* Main Grid: Left Stage (70%) & Right Guru Chat (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* PRIMARY TEACHER COLUMN */}
          <div className={`space-y-4 ${isChatOpen ? "lg:col-span-8" : "lg:col-span-12"} transition-all duration-300`}>
            {/* 1. 3D VIRTUAL GURU STAGE */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] max-h-[580px] rounded-2xl border border-card-border bg-card/90 overflow-hidden shadow-2xl flex flex-col">
              {/* Stage Top Bar Badge */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
                <span className="mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-foreground/80 border border-white/10 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  3D Guru Stage · {activeChapter.title}
                </span>
              </div>

              {/* Chat Toggle Button */}
              <button
                type="button"
                onClick={() => setIsChatOpen((v) => !v)}
                className="absolute top-3 right-3 z-20 mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-foreground/80 hover:text-primary border border-white/10 flex items-center gap-1 transition-colors cursor-pointer"
                title={isChatOpen ? "Expand 3D Stage View" : "Open Guru Q&A Chat"}
              >
                <MessageSquare className="h-3 w-3 text-primary" />
                <span>{isChatOpen ? "Hide Chat" : "Ask Guru"}</span>
              </button>

              {/* Stage Visual Switcher */}
              <div className="relative flex-1 w-full min-h-0 bg-gradient-to-b from-black/60 via-background/40 to-background">
                {/* Mode A: Authentic 3D Mocap Take */}
                {activeChapter.visualMode === "mocap-3d" && clip && manifest ? (
                  <div className="h-full w-full relative">
                    <MocapFigure
                      sex={mentorGender}
                      showBody={showBody}
                      showSkeleton={showSkeleton}
                      steady
                      showOverlayControls
                      onReady={(api) => {
                        mocapApiRef.current = api;
                        if (clip) {
                          const sampled = samplePose(clip, mocapTimeRef.current, poseBufferRef.current);
                          api.show(sampled);
                        }
                      }}
                      className="h-full w-full"
                    />

                    {/* Step indicator overlay */}
                    {currentStep && (
                      <div className="absolute bottom-3 left-3 z-10 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-xs">
                        <span className="mono text-[8px] uppercase tracking-widest text-primary block">
                          Step {mocapStepIndex + 1} of {manifest.steps.length}
                        </span>
                        <span className="serif font-semibold text-foreground">
                          {currentStep.name}
                        </span>
                        <p className="serif text-[10px] text-foreground/60 italic truncate max-w-xs">
                          {currentStep.gloss}
                        </p>
                      </div>
                    )}
                  </div>
                ) : activeChapter.visualMode === "concept-triad" || currLesson.slug === "intro-bharatanatyam" ? (
                  /* Mode B: Nritta / Nritya / Natya Triad Visualizer */
                  <div className="h-full w-full overflow-y-auto p-4 flex items-center justify-center">
                    <div className="w-full max-w-2xl">
                      <NrittaNrityaVisualizer />
                    </div>
                  </div>
                ) : activeChapter.visualMode === "rhythm-meter" || currLesson.slug === "adi-tala-and-rhythm" ? (
                  /* Mode C: Adi Tala 8-Beat Visualizer */
                  <div className="h-full w-full overflow-y-auto p-4 flex items-center justify-center">
                    <div className="w-full max-w-2xl">
                      <AdiTalaVisualizer />
                    </div>
                  </div>
                ) : activeChapter.visualMode === "posture-3d" || currLesson.slug === "samapada-and-aramandi" ? (
                  /* Mode D: 3D Posture Model + Alignment Checkpoints */
                  <div className="h-full w-full relative flex flex-col md:flex-row">
                    <div className="h-1/2 md:h-full md:w-1/2 relative">
                      <NamasteFigure sex={mentorGender} showBody showJoints className="h-full w-full" />
                    </div>
                    <div className="h-1/2 md:h-full md:w-1/2 p-3 overflow-y-auto flex items-center">
                      <PostureAlignmentVisualizer className="w-full" />
                    </div>
                  </div>
                ) : activeChapter.visualMode === "mocap-in-production" || currLesson.slug === "natta-adavu" ? (
                  /* Mode E: Studio Mocap In-Production State */
                  <div className="h-full w-full p-6 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <span className="mono text-[9px] uppercase tracking-widest text-amber-400 font-semibold mb-1">
                      Authentic Studio Mocap In Production
                    </span>
                    <h3 className="serif text-xl font-bold text-foreground max-w-md mb-2">
                      Natta Adavu (Stretching Footwork)
                    </h3>
                    <p className="serif text-xs text-foreground/70 max-w-lg mb-4 leading-relaxed">
                      Studio motion capture recording is currently in post-production. Explore the authentic Sollukattu rhythm drills, Tripataka arm extensions, and Kutti Thattu heel strikes below.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/75">
                        Rhythm: Tai Yum Dat Ta
                      </span>
                      <span className="mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/75">
                        Feet: Kutti Thattu Heel Strike
                      </span>
                      <span className="mono text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/75">
                        Arms: Natyarambha Tripataka
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Mode F: Default Stationary 3D Guru Figure */
                  <div className="h-full w-full relative">
                    <NamasteFigure sex={mentorGender} showBody className="h-full w-full" />
                  </div>
                )}
              </div>

              {/* Mocap Motion Bar (Only displayed during authentic mocap demonstrations) */}
              {activeChapter.visualMode === "mocap-3d" && clip && manifest && (
                <div className="p-2.5 bg-black/80 backdrop-blur-md border-t border-white/10 flex flex-wrap items-center justify-between gap-2 z-20">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleMocapPlayback}
                      className="h-8 w-8 rounded-full bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer"
                      title={isMocapPlaying ? "Pause 3D Demonstration" : "Play 3D Demonstration"}
                    >
                      {isMocapPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateMocapPose(0)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
                      title="Rewind to start"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <span className="mono text-[10px] text-foreground/60">
                      {clock(mocapTime)} / {clock(clip.meta.duration)}
                    </span>
                  </div>

                  {/* Scrubber */}
                  <input
                    type="range"
                    min={0}
                    max={clip.meta.duration}
                    step={0.01}
                    value={mocapTime}
                    onChange={(e) => updateMocapPose(parseFloat(e.target.value))}
                    className="flex-1 min-w-[120px] max-w-xs accent-primary cursor-pointer h-1 bg-white/20 rounded-lg appearance-none"
                    aria-label="Seek 3D demonstration timeline"
                  />

                  {/* Step Selector Pills */}
                  {manifest.steps.length > 0 && (
                    <div className="hidden sm:flex items-center gap-1">
                      {manifest.steps.map((st, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => seekMocapStep(i)}
                          className={`mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                            i === mocapStepIndex
                              ? "bg-primary text-black border-primary font-bold"
                              : "bg-white/5 text-foreground/60 border-white/10 hover:border-primary/50"
                          }`}
                          title={`Jump to Step ${i + 1}: ${st.name}`}
                        >
                          S{i + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Skeleton & Mesh Toggles */}
                  <div className="hidden sm:flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowSkeleton((v) => !v)}
                      className={`mono text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        showSkeleton
                          ? "bg-primary/20 text-primary border-primary/40 font-semibold"
                          : "text-foreground/50 border-white/10 hover:text-foreground"
                      }`}
                      title={showSkeleton ? "Hide Skeleton" : "Show Skeleton"}
                    >
                      Rig {showSkeleton ? "On" : "Off"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBody((v) => !v)}
                      className={`mono text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        showBody
                          ? "bg-primary/20 text-primary border-primary/40 font-semibold"
                          : "text-foreground/50 border-white/10 hover:text-foreground"
                      }`}
                      title={showBody ? "Hide 3D Skin" : "Show 3D Skin"}
                    >
                      Mesh {showBody ? "On" : "Off"}
                    </button>
                  </div>

                  {/* Speed toggle */}
                  <div className="flex items-center gap-1">
                    {[0.5, 0.75, 1.0].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setMocapSpeed(s)}
                        className={`mono text-[8.5px] px-1.5 py-0.5 rounded border cursor-pointer ${
                          mocapSpeed === s
                            ? "bg-primary/20 text-primary border-primary/40 font-bold"
                            : "text-foreground/50 border-transparent hover:text-foreground"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. VOICE-LED TEACHING BAR (The primary teacher controls) */}
            <div className="rounded-2xl border border-card-border bg-card/80 p-4 shadow-md space-y-3">
              {/* 8-Chapter Step Dots */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
                {chapters.map((ch, idx) => {
                  const isActive = idx === currentChapterIndex;
                  const isCompleted = idx <= maxChapterReached;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => goToChapter(idx)}
                      className={`flex-1 min-w-[70px] sm:min-w-[90px] py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        isActive
                          ? "bg-primary/15 border-primary text-primary shadow-sm ring-1 ring-primary/40"
                          : isCompleted
                          ? "bg-foreground/5 border-foreground/15 text-foreground/80 hover:border-primary/40"
                          : "bg-foreground/[0.02] border-foreground/10 text-foreground/40 hover:text-foreground/60"
                      }`}
                      title={ch.title}
                    >
                      <span className="mono text-[8px] uppercase tracking-wider block">
                        {idx + 1}. {ch.shortTitle}
                      </span>
                      <div
                        className={`h-1.5 w-6 rounded-full transition-colors ${
                          isActive
                            ? "bg-primary"
                            : isCompleted
                            ? "bg-emerald-400"
                            : "bg-foreground/20"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Main Audio Voice Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-foreground/10">
                <div className="flex items-center gap-2">
                  {/* Previous Chapter */}
                  <button
                    type="button"
                    onClick={handlePrevChapter}
                    disabled={currentChapterIndex === 0}
                    className="p-2 rounded-xl border border-foreground/15 hover:bg-foreground/10 text-foreground/80 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    title="Previous Chapter"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  {/* Primary Play / Pause Voice Narration Button */}
                  <button
                    type="button"
                    onClick={handleToggleNarration}
                    disabled={isNarrationLoading}
                    className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2.5 transition-all shadow-md cursor-pointer ${
                      isNarrating
                        ? "bg-primary text-black hover:bg-primary/90 ring-2 ring-primary/50"
                        : "bg-primary text-black hover:bg-primary/90"
                    }`}
                    title={isNarrating ? "Pause Voice Narration" : "Listen to Guru teach this chapter"}
                  >
                    {isNarrationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                    ) : isNarrating ? (
                      <Pause className="h-4 w-4 text-black" />
                    ) : (
                      <Play className="h-4 w-4 text-black ml-0.5" />
                    )}
                    <span className="serif text-sm tracking-wide">
                      {isNarrationLoading
                        ? "Guru is preparing speech…"
                        : isNarrating
                        ? "Pause Narration"
                        : "Listen to Guru"}
                    </span>
                    {isNarrating && (
                      <span className="flex items-center gap-0.5 ml-1">
                        <span className="h-2 w-0.5 bg-black animate-pulse" />
                        <span className="h-3 w-0.5 bg-black animate-pulse delay-75" />
                        <span className="h-2 w-0.5 bg-black animate-pulse delay-150" />
                      </span>
                    )}
                  </button>

                  {/* Replay Chapter Narration */}
                  <button
                    type="button"
                    onClick={handleReplayNarration}
                    className="p-2 rounded-xl border border-foreground/15 hover:bg-foreground/10 text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
                    title="Replay this chapter's voice narration"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  {/* Next Chapter */}
                  <button
                    type="button"
                    onClick={handleNextChapter}
                    disabled={currentChapterIndex === chapters.length - 1}
                    className="p-2 rounded-xl border border-foreground/15 hover:bg-foreground/10 text-foreground/80 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    title="Next Chapter"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Secondary Audio Settings: Speed, Captions, Mute */}
                <div className="flex items-center gap-2 ml-auto">
                  {/* Narration Speed */}
                  <div className="flex items-center rounded-lg border border-foreground/15 p-0.5 bg-foreground/5">
                    {NARRATION_SPEEDS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNarrationSpeed(s)}
                        className={`mono text-[9px] px-2 py-1 rounded transition-colors cursor-pointer ${
                          narrationSpeed === s
                            ? "bg-primary text-black font-bold"
                            : "text-foreground/60 hover:text-foreground"
                        }`}
                        title={`Playback speed ${s}x`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  {/* Captions Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowCaptions((v) => !v)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      showCaptions
                        ? "bg-primary/10 border-primary/40 text-primary"
                        : "border-foreground/15 text-foreground/50 hover:text-foreground"
                    }`}
                    title={showCaptions ? "Hide Subtitles" : "Show Subtitles"}
                  >
                    <Subtitles className="h-4 w-4" />
                  </button>

                  {/* Mute Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsMuted((v) => !v)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isMuted
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : "border-foreground/15 text-foreground/70 hover:text-foreground"
                    }`}
                    title={isMuted ? "Unmute audio" : "Mute audio"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Subtitle / Closed Caption Bar */}
              {showCaptions && (
                <div
                  className={`p-3 rounded-xl border transition-all text-sm leading-relaxed ${
                    isNarrating
                      ? "bg-primary/5 border-primary/30 text-foreground font-medium shadow-sm"
                      : "bg-foreground/[0.02] border-foreground/10 text-foreground/80 italic"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="mono text-[8px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1">
                      <Mic className="h-2.5 w-2.5" /> Guru Narration ({langConfig.nativeName}):
                    </span>
                    {!isVoiceSupported(selectedLang) && (
                      <span className="mono text-[8px] uppercase tracking-wider text-amber-400">
                        (Text Only · Regional Translation)
                      </span>
                    )}
                  </div>
                  <p className="serif text-[0.95rem]">
                    &ldquo;{getChapterVoiceScript(activeChapter, selectedLang)}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* 3. ACTIVE CHAPTER PEDAGOGY CARD */}
            <div className="rounded-2xl border border-card-border bg-card/80 p-5 shadow-sm space-y-4">
              <div>
                <span className="mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  Chapter {currentChapterIndex + 1}: {activeChapter.shortTitle}
                </span>
                <h3 className="serif text-xl font-bold text-foreground mt-2">
                  {activeChapter.title}
                </h3>
                <p className="serif text-sm text-foreground/80 mt-1 leading-relaxed">
                  {activeChapter.summary}
                </p>
              </div>

              {/* Technique Cues (if available in this chapter) */}
              {activeChapter.techniqueCues && activeChapter.techniqueCues.length > 0 && (
                <div className="pt-2">
                  <span className="mono text-[9px] uppercase tracking-wider text-primary font-semibold block mb-2">
                    Key Alignment & Technique Cues:
                  </span>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {activeChapter.techniqueCues.map((cue, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl border border-foreground/10 bg-foreground/[0.02] flex items-start gap-2"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span className="serif text-xs text-foreground/85 leading-normal">
                          {cue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Mistakes & Anatomical Safety (if available in this chapter) */}
              {activeChapter.commonMistakes && activeChapter.commonMistakes.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                    <span className="mono text-[9px] uppercase tracking-wider text-amber-400 font-semibold">
                      Anatomical Safety & Common Mistakes:
                    </span>
                  </div>
                  <div className="space-y-2">
                    {activeChapter.commonMistakes.map((m, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs space-y-1"
                      >
                        <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                          <span>Mistake:</span>
                          <span>{m.mistake}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span>Correction:</span>
                          <span>{m.correction}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formative Understanding Check (Quiz in Chapter 7) */}
              {activeChapter.understandingCheck && (
                <div className="pt-3 border-t border-foreground/10">
                  <div className="p-4 rounded-xl border border-primary/25 bg-primary/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      <span className="mono text-[10px] uppercase tracking-wider text-primary font-bold">
                        Formative Understanding Check
                      </span>
                    </div>

                    <h4 className="serif text-base font-semibold text-foreground">
                      {activeChapter.understandingCheck.question}
                    </h4>

                    {/* Quiz Options */}
                    <div className="space-y-2 pt-1">
                      {activeChapter.understandingCheck.options.map((opt, optIdx) => {
                        const isSelected = quizSelectedOption === optIdx;
                        const isCorrect = optIdx === activeChapter.understandingCheck?.correctIndex;
                        const hasAnswered = quizAnswered && quizSelectedOption !== null;

                        let btnClass = "border-foreground/15 bg-background hover:border-primary/40 text-foreground/85";
                        if (hasAnswered) {
                          if (isCorrect) {
                            btnClass = "border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold";
                          } else if (isSelected && !isCorrect) {
                            btnClass = "border-rose-500 bg-rose-500/10 text-rose-300";
                          } else {
                            btnClass = "opacity-40 border-foreground/10 text-foreground/50";
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectQuizOption(optIdx)}
                            disabled={hasAnswered}
                            className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between gap-3 cursor-pointer ${btnClass}`}
                          >
                            <span className="serif text-[0.9rem]">{opt}</span>
                            {hasAnswered && isCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback and Explanation */}
                    {quizAnswered && quizSelectedOption !== null && (
                      <div className="p-3 rounded-lg bg-background/80 border border-foreground/10 text-xs mt-2 space-y-1">
                        <span className="mono text-[9px] uppercase tracking-wider font-bold block text-primary">
                          Guru Explanation:
                        </span>
                        <p className="serif text-foreground/90 leading-relaxed">
                          {activeChapter.understandingCheck.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chapter 8: Next Steps & Transition */}
              {activeChapter.id === "transition" && (
                <div className="pt-3 border-t border-foreground/10">
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center space-y-3">
                    <Award className="h-8 w-8 text-primary mx-auto" />
                    <h4 className="serif text-lg font-bold text-foreground">
                      Module Completed!
                    </h4>
                    <p className="serif text-xs text-foreground/75 max-w-md mx-auto leading-relaxed">
                      You have journeyed through all 8 teaching chapters with the 3D Virtual Guru. Continue to maintain daily sadhana and discipline.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleToggleLessonComplete}
                        className="mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl bg-primary text-black font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        {isLessonCompleted ? "✓ Completed" : "Mark Module Complete"}
                      </button>
                      {activeChapter.nextLessonSlug && (
                        <Link
                          href={`/learn/bharatanatyam/${activeChapter.nextLessonSlug}`}
                          className="mono text-xs uppercase tracking-wider px-4 py-2 rounded-xl border border-primary/50 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5"
                        >
                          <span>Proceed to Next Lesson</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. PROGRESSIVE DISCLOSURE: EXPANDABLE GURU CLASSICAL NOTES */}
            <div className="rounded-2xl border border-card-border bg-card/60 p-4 shadow-sm">
              <button
                type="button"
                onClick={() => setNotesExpanded((v) => !v)}
                className="w-full flex items-center justify-between text-left text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="serif text-sm font-semibold">
                    Guru&rsquo;s In-Depth Classical Notes & Shastra References
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="mono text-[9px] uppercase tracking-wider text-foreground/50">
                    {notesExpanded ? "Hide Details" : "Expand Details"}
                  </span>
                  {notesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {notesExpanded && (
                <div className="mt-4 pt-4 border-t border-foreground/10 space-y-4 text-xs">
                  {/* Shastra grounding citation */}
                  {provenance && (
                    <div className="p-3 rounded-xl bg-foreground/[0.02] border border-foreground/10">
                      <span className="mono text-[9px] uppercase tracking-wider text-primary font-bold block mb-1">
                        Classical Provenance & Source Text:
                      </span>
                      <p className="serif text-foreground/80 leading-relaxed">
                        {provenance.sourceText} {provenance.sourceCitation ? `(${provenance.sourceCitation})` : ""}
                      </p>
                      <p className="serif text-foreground/60 text-xs mt-1">
                        Tradition: {provenance.tradition} · Status: {provenance.statusLabel}
                      </p>
                      {provenance.notes && (
                        <p className="serif text-foreground/70 italic text-xs mt-1 border-l-2 border-primary/50 pl-2">
                          {provenance.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Syllabus breakdown */}
                  <div>
                    <span className="mono text-[9px] uppercase tracking-wider text-primary font-bold block mb-1">
                      Pedagogical Objectives:
                    </span>
                    <ul className="space-y-1 list-disc list-inside text-foreground/75 serif">
                      {currLesson.objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Teacher's Note */}
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <span className="mono text-[9px] uppercase tracking-wider text-primary font-bold block mb-1">
                      Natyacharya&rsquo;s Advisory:
                    </span>
                    <p className="serif text-foreground/85 leading-relaxed">
                      &ldquo;{currLesson.guruNote}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: INTEGRATED 3D VIRTUAL GURU CHAT */}
          {isChatOpen && (
            <div className="lg:col-span-4 sticky top-28 space-y-4">
              <div className="rounded-2xl border border-card-border bg-card/90 overflow-hidden shadow-xl">
                <GuruChatPanel
                  currentLessonSlug={lessonSlug}
                  currentLessonTitle={currLesson.title}
                  currentChapterIndex={currentChapterIndex}
                  currentChapterTitle={activeChapter.title}
                  currentStepIndex={mocapStepIndex}
                  currentStepName={currentStep?.name}
                  currentStepGloss={currentStep?.gloss}
                  currentStepCues={currentStep?.cues}
                  lang={selectedLang}
                  audioEngine={audioEngineRef.current}
                  className="h-[650px] border-none shadow-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
