"use client";

import GuruChatPanel from "@/components/guru/GuruChatPanel";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  ScrollText,
  ShieldAlert,
  Compass,
  Layers,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import type { CurriculumLesson } from "@/lib/curriculum/curriculumData";
import { getLessonProvenance } from "@/lib/curriculum/provenance";
import { CurriculumProgressService } from "@/lib/services/CurriculumProgressService";
import { Eyebrow, Rule } from "@/components/ui/editorial";

// Dynamic import for 3D posture visualizer
const NamasteFigure = dynamic(() => import("@/components/three/NamasteFigure"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-black/40">
      <span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground/45">
        Loading 3D Posture Model…
      </span>
    </div>
  ),
});

export default function CurriculumLessonView({ lesson }: { lesson: CurriculumLesson }) {
  const [completed, setCompleted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return CurriculumProgressService.isCompleted(lesson.slug);
  });
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    // Record visit
    CurriculumProgressService.recordVisit(lesson.slug);
  }, [lesson.slug]);

  const toggleCompleted = () => {
    if (completed) {
      CurriculumProgressService.unmarkCompleted(lesson.slug);
      setCompleted(false);
    } else {
      CurriculumProgressService.markCompleted(lesson.slug);
      setCompleted(true);
    }
  };

  const provenance = lesson.provenance || getLessonProvenance(lesson.slug);
  const safetyNote = lesson.safetyAdvisory || provenance?.safetyAdvisory;
  const show3DFigure =
    lesson.slug === "samapada-and-aramandi" ||
    lesson.slug === "basic-hand-positions" ||
    lesson.slug === "attire-and-environment" ||
    lesson.slug === "intro-bharatanatyam";

  return (
    <div className="min-h-screen px-4 pt-28 pb-24 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/learn/bharatanatyam"
            className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-foreground/50 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Bharatanatyam Curriculum
          </Link>

          <span className="mono text-[10px] uppercase tracking-wider text-primary">
            {lesson.levelName}
          </span>
        </div>

        {/* Header Block */}
        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="mono text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25">
              {lesson.levelName}
            </span>
            <span className="mono text-[10px] text-foreground/40 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {lesson.durationMinutes} minutes
            </span>
            {provenance && (
              <span
                className={`mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium ${
                  provenance.validationStatus === "source-supported"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : provenance.validationStatus === "guru-review-required"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                }`}
              >
                {provenance.statusLabel}
              </span>
            )}
            {completed && (
              <span className="mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </span>
            )}
          </div>

          <h1 className="serif font-normal tracking-[-0.015em] leading-[1.08] text-[clamp(2rem,4.5vw,3.2rem)] text-foreground">
            {lesson.title}
          </h1>

          <p className="serif italic text-[1.15rem] text-foreground/60 mt-2 max-w-3xl leading-relaxed">
            {lesson.subtitle}
          </p>
        </header>

        {/* Safety Advisory Banner */}
        {safetyNote && (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-4 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.16em] text-amber-400 font-semibold">
                Physical Practice & Safety Advisory
              </p>
              <p className="serif text-[0.93rem] text-foreground/80 mt-1 leading-relaxed">
                {safetyNote}
              </p>
            </div>
          </div>
        )}

        {/* Status / Alert Banner if mocap is pending */}
        {lesson.status === "mocap-pending" && (
          <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.16em] text-amber-400 font-semibold">
                Natyacharya Capture In Production
              </p>
              <p className="serif text-[0.95rem] text-foreground/80 mt-1 leading-relaxed">
                {lesson.guruReviewNote ||
                  "This module's movement capture is scheduled for recording with our Natyacharya team. The step breakdown, sollukattu, and technique cues below are fully verified from the Natya Shastra and Abhinaya Darpana texts."}
              </p>
            </div>
          </div>
        )}

        <Rule className="mt-8 mb-10" />

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] items-start">
          {/* Main Left Content Column */}
          <div className="space-y-10">
            {/* Overview Section */}
            <section>
              <Eyebrow tone="primary">module overview</Eyebrow>
              <div className="serif text-[1.05rem] leading-[1.68] text-foreground/85 mt-4 space-y-4">
                <p>{lesson.description}</p>
              </div>
            </section>

            {/* Interactive 3D Guru Posture Preview for Posture Modules */}
            {show3DFigure && (
              <section className="rounded-2xl border border-card-border bg-card/80 p-4 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <Eyebrow tone="primary">3D Posture Architecture</Eyebrow>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResetKey((k) => k + 1)}
                    className="mono inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-foreground/50 hover:text-primary transition-colors"
                  >
                    <RotateCcw className="h-2.5 w-2.5" /> Reset View
                  </button>
                </div>

                <div className="relative h-72 sm:h-80 w-full rounded-xl overflow-hidden bg-black/60 border border-foreground/10">
                  <NamasteFigure
                    key={resetKey}
                    sex="female"
                    showBody={false}
                    showJoints={false}
                    zoom={4.2}
                    className="h-full w-full"
                  />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="mono text-[8px] uppercase tracking-wider text-foreground/45 bg-black/60 px-2 py-0.5 rounded-full">
                      Drag to rotate 360° · Scroll to zoom
                    </span>
                    <span className="serif text-[0.82rem] italic text-primary/80">
                      Samapada & Aharya Adornments
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Learning Objectives */}
            <section className="rounded-2xl border border-card-border bg-card/60 p-6">
              <Eyebrow tone="primary">learning objectives</Eyebrow>
              <ul className="mt-4 space-y-3">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <span className="serif text-[0.98rem] leading-[1.55] text-foreground/85">
                      {obj}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Key Concepts & Theoretical Breakdown */}
            <section>
              <Eyebrow tone="primary">key concepts</Eyebrow>
              <div className="mt-4 space-y-4">
                {lesson.keyConcepts.map((concept, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-foreground/12 bg-card/50 p-4 transition-colors hover:border-foreground/20"
                  >
                    <h4 className="serif text-[1.12rem] font-semibold text-foreground/95">
                      {concept.title}
                    </h4>
                    <p className="serif text-[0.96rem] leading-[1.58] text-foreground/75 mt-1.5">
                      {concept.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Technique Cues */}
            <section>
              <Eyebrow tone="primary">essential technique cues</Eyebrow>
              <div className="mt-4 border-l-2 border-primary/50 pl-5 space-y-3">
                {lesson.techniqueCues.map((cue, i) => (
                  <p key={i} className="serif text-[0.98rem] leading-[1.6] text-foreground/80">
                    <strong className="text-primary font-mono mr-1.5">{i + 1}.</strong>
                    {cue}
                  </p>
                ))}
              </div>
            </section>

            {/* Sollukattu Rhythm Table if present */}
            {lesson.sollukattu && lesson.sollukattu.length > 0 && (
              <section className="rounded-2xl border border-card-border bg-card/60 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <Eyebrow tone="primary">sollukattu & rhythm syllables</Eyebrow>
                </div>
                <div className="space-y-3">
                  {lesson.sollukattu.map((s, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-foreground/10 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <span className="mono text-[11px] font-semibold text-primary">
                          “{s.syllables}”
                        </span>
                        <p className="serif text-[0.88rem] text-foreground/60 italic mt-0.5">
                          {s.meaning}
                        </p>
                      </div>
                      <span className="mono text-[9px] uppercase tracking-wider text-foreground/45 bg-foreground/5 px-2 py-1 rounded">
                        Cadence: {s.rhythm}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Common Mistakes & Corrections */}
            {lesson.commonMistakes.length > 0 && (
              <section>
                <Eyebrow tone="primary">where it goes wrong (and how to fix it)</Eyebrow>
                <div className="mt-4 space-y-4">
                  {lesson.commonMistakes.map((m, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-rose-500/25 bg-rose-500/[0.02] p-4.5"
                    >
                      <p className="serif text-[0.96rem] text-rose-300 font-medium">
                        Mistake: <span className="font-normal text-foreground/80">{m.mistake}</span>
                      </p>
                      <p className="serif text-[0.96rem] text-emerald-400 font-medium mt-2 pt-2 border-t border-foreground/10">
                        Correction:{" "}
                        <span className="font-normal text-foreground/80">{m.correction}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tradition & Style Nuances (Bani variations) */}
            {lesson.traditionNotes && (
              <section className="rounded-xl border border-foreground/12 bg-foreground/[0.02] p-5">
                <Eyebrow>tradition & style variations</Eyebrow>
                <p className="serif text-[0.95rem] leading-[1.6] text-foreground/70 mt-2">
                  {lesson.traditionNotes}
                </p>
              </section>
            )}

            {/* Interactive Virtual Guru Assistant Section */}
            <section className="rounded-2xl border border-card-border bg-card/60 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <Eyebrow tone="primary">interactive virtual guru</Eyebrow>
              </div>
              <p className="serif text-[0.92rem] text-foreground/70 mb-4">
                Ask questions about this module&rsquo;s postures, anatomical alignment, common errors, or traditional context:
              </p>
              <div className="h-[520px]">
                <GuruChatPanel
                  currentLessonSlug={lesson.slug}
                  currentLessonTitle={lesson.title}
                  className="h-full shadow-none border-foreground/10"
                />
              </div>
            </section>

            {/* Knowledge Provenance & Review Status Card */}
            {provenance && (
              <section className="rounded-2xl border border-card-border bg-card/40 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ScrollText className="h-4 w-4 text-primary" />
                  <Eyebrow tone="primary">knowledge provenance & sources</Eyebrow>
                </div>
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="mono text-[10px] uppercase tracking-wider text-foreground/50">Primary Reference</span>
                    <span className="serif text-[0.93rem] text-foreground/90 font-medium sm:text-right max-w-md">{provenance.sourceText}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="mono text-[10px] uppercase tracking-wider text-foreground/50">Lineage Context</span>
                    <span className="serif text-[0.93rem] text-foreground/85 sm:text-right">{provenance.tradition}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="mono text-[10px] uppercase tracking-wider text-foreground/50">Validation State</span>
                    <span className={`mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${
                      provenance.validationStatus === "source-supported"
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                        : provenance.validationStatus === "guru-review-required"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                        : "bg-sky-500/15 text-sky-400 border border-sky-500/25"
                    }`}>
                      {provenance.statusLabel}
                    </span>
                  </div>
                  {provenance.reviewer && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <span className="mono text-[10px] uppercase tracking-wider text-foreground/50">Reviewer Note</span>
                      <span className="serif text-[0.91rem] text-foreground/75 sm:text-right">{provenance.reviewer}</span>
                    </div>
                  )}
                  <p className="serif text-[0.89rem] text-foreground/65 pt-2 border-t border-foreground/10 leading-relaxed italic">
                    {provenance.notes}
                  </p>
                </div>
              </section>
            )}

            {/* Bottom In-Page Completion Bar */}
            <div className="rounded-2xl border border-primary/25 bg-primary/[0.03] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Eyebrow tone="primary">lesson progress</Eyebrow>
                <p className="serif text-[0.95rem] text-foreground/80 mt-1">
                  {completed ? "You have completed this module. Ready for revision or the next step?" : "Studied all key concepts and cues? Mark this module complete to update your curriculum progress."}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleCompleted}
                className={`mono shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] font-semibold transition-colors shadow-sm ${
                  completed
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer"
                    : "bg-primary text-black hover:bg-primary/85 cursor-pointer"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {completed ? "Completed ✓ (Reset)" : "Mark as Completed"}
              </button>
            </div>
          </div>

          {/* Sidebar Action & Progression Card */}
          <aside className="space-y-6 lg:sticky lg:top-28">
            {/* Guru's Counsel Card */}
            <div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
              <Eyebrow tone="primary">guru&rsquo;s counsel</Eyebrow>
              <p className="serif italic text-[0.98rem] leading-[1.62] text-foreground/80 mt-3">
                &ldquo;{lesson.guruNote}&rdquo;
              </p>
            </div>

            {/* Mark as Completed Action */}
            <div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <Eyebrow>lesson status</Eyebrow>
                <span className="mono text-[10px] text-foreground/45 uppercase tracking-wider">
                  {completed ? "Completed" : "In Progress"}
                </span>
              </div>

              <button
                type="button"
                onClick={toggleCompleted}
                className={`w-full mono inline-flex items-center justify-center gap-2 rounded-full py-3 text-[10px] uppercase tracking-[0.16em] font-semibold transition-colors shadow-sm ${
                  completed
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 cursor-pointer"
                    : "bg-primary text-black hover:bg-primary/85 cursor-pointer"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {completed ? "Completed ✓ (Click to Reset)" : "Mark as Completed"}
              </button>
            </div>

            {/* Prerequisites Review */}
            {lesson.prerequisites.length > 0 && (
              <div className="rounded-2xl border border-card-border bg-card p-5 shadow-sm">
                <Eyebrow>prerequisites</Eyebrow>
                <ul className="mt-3 space-y-2">
                  {lesson.prerequisites.map((p) => {
                    const isDone = CurriculumProgressService.isCompleted(p.slug);
                    return (
                      <li key={p.slug}>
                        <Link
                          href={`/learn/bharatanatyam/${p.slug}`}
                          className="flex items-center justify-between text-xs hover:text-primary transition-colors py-1"
                        >
                          <span className="serif text-[0.92rem] text-foreground/75 truncate">
                            {p.title}
                          </span>
                          <span
                            className={`mono text-[9px] uppercase px-1.5 py-0.2 rounded border ${
                              isDone
                                ? "border-emerald-500/40 text-emerald-400"
                                : "border-foreground/20 text-foreground/40"
                            }`}
                          >
                            {isDone ? "Done" : "Review"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Next Lesson Router Card */}
            {lesson.nextLessonSlug && (
              <div className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-5 shadow-sm space-y-3">
                <Eyebrow tone="primary">up next</Eyebrow>
                <p className="serif text-[0.95rem] text-foreground/80 leading-snug">
                  Advance to the next sequential module in the curriculum.
                </p>
                <Link
                  href={`/learn/bharatanatyam/${lesson.nextLessonSlug}`}
                  className="mono w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-black font-semibold hover:bg-primary/85 transition-colors shadow-sm"
                >
                  Continue Journey <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
