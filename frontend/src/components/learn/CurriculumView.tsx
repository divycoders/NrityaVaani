"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  Layers,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  AlertCircle,
  Eye,
} from "lucide-react";
import {
  BHARATANATYAM_CURRICULUM,
  CURRICULUM_LEVELS,
  
} from "@/lib/curriculum/curriculumData";
import { CurriculumProgressService } from "@/lib/services/CurriculumProgressService";
import { getLessonProvenance } from "@/lib/curriculum/provenance";


export default function CurriculumView({ className = "" }: { className?: string }) {
  const [selectedLevel, setSelectedLevel] = useState<number | "all">("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    const all = CurriculumProgressService.getAllProgress();
    const map: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(all)) {
      if (v.completed) map[k] = true;
    }
    return map;
  });

  const totalLessons = BHARATANATYAM_CURRICULUM.length;
  const completedCount = useMemo(() => {
    return BHARATANATYAM_CURRICULUM.filter((l) => progressMap[l.slug]).length;
  }, [progressMap]);

  const percentComplete = Math.round((completedCount / totalLessons) * 100);

  // Resume lesson: first uncompleted lesson, or the last visited one
  const nextUpLesson = useMemo(() => {
    return BHARATANATYAM_CURRICULUM.find((l) => !progressMap[l.slug]) || BHARATANATYAM_CURRICULUM[0];
  }, [progressMap]);

  // Filtered lessons
  const filteredLessons = useMemo(() => {
    return BHARATANATYAM_CURRICULUM.filter((lesson) => {
      // Level filter
      if (selectedLevel !== "all" && lesson.level !== selectedLevel) {
        return false;
      }
      // Type filter
      if (selectedType === "3d" && !lesson.hasMotionClip) {
        return false;
      }
      if (selectedType === "concepts" && lesson.hasMotionClip) {
        return false;
      }
      if (selectedType === "completed" && !progressMap[lesson.slug]) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = lesson.title.toLowerCase().includes(q);
        const matchesSubtitle = lesson.subtitle.toLowerCase().includes(q);
        const matchesDesc = lesson.description.toLowerCase().includes(q);
        const matchesConcepts = lesson.keyConcepts.some((c) =>
          c.title.toLowerCase().includes(q) || c.explanation.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesSubtitle && !matchesDesc && !matchesConcepts) {
          return false;
        }
      }
      return true;
    });
  }, [selectedLevel, selectedType, searchQuery, progressMap]);

  return (
    <div className={`space-y-12 ${className}`}>
      {/* ---------------- Curriculum Overview Strip ---------------- */}
      <div className="rounded-2xl border border-card-border bg-card/75 p-6 shadow-sm backdrop-blur-sm">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-primary">
                Pedagogical Progression
              </span>
              <span className="text-foreground/30">·</span>
              <span className="mono text-[10px] uppercase tracking-wider text-foreground/50">
                6 Levels · 12 Structured Modules
              </span>
            </div>
            <h3 className="serif text-[1.45rem] leading-tight text-foreground/95">
              Structured Bharatanatyam Learning Journey
            </h3>
            <p className="serif text-[0.98rem] leading-[1.58] text-foreground/70 mt-2 max-w-xl">
              From your very first sacred posture to rhythmic adavu footwork and Sanskrit mudras.
              Each module builds sequentially on verified Natya Shastra geometry, guided by the
              interactive 3D Virtual Guru.
            </p>
          </div>

          {/* Progress Tracker Card */}
          <div className="rounded-xl border border-foreground/12 bg-foreground/[0.02] p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground/50">
                Your Progress
              </span>
              <span className="mono text-[12px] font-semibold text-primary">
                {completedCount} / {totalLessons} Completed ({percentComplete}%)
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2 rounded-full bg-foreground/10 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${percentComplete}%` }}
              />
            </div>

            {nextUpLesson && (
              <div className="pt-2 border-t border-foreground/10 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="mono text-[9px] uppercase tracking-wider text-foreground/45">
                    {completedCount === 0 ? "Start Here:" : "Next Up:"}
                  </p>
                  <p className="serif text-[0.95rem] font-medium text-foreground/90 truncate">
                    {nextUpLesson.title}
                  </p>
                </div>
                <Link
                  href={`/learn/bharatanatyam/${nextUpLesson.slug}`}
                  className="mono shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[10px] uppercase tracking-wider text-black font-semibold hover:bg-primary/85 transition-colors shadow-sm"
                >
                  {completedCount === 0 ? "Begin" : "Resume"} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Filter & Search Toolbar ---------------- */}
      <div className="space-y-4">
        {/* Level Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-foreground/10 pb-3">
          <button
            type="button"
            onClick={() => setSelectedLevel("all")}
            className={`mono rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.16em] transition-colors ${
              selectedLevel === "all"
                ? "bg-primary text-black font-semibold shadow-sm"
                : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
            }`}
          >
            All Levels (1–6)
          </button>
          {CURRICULUM_LEVELS.map((lvl) => (
            <button
              key={lvl.level}
              type="button"
              onClick={() => setSelectedLevel(lvl.level)}
              className={`mono rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${
                selectedLevel === lvl.level
                  ? "bg-primary text-black font-semibold shadow-sm"
                  : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              L{lvl.level}: {lvl.title.replace(`Level ${lvl.level}: `, "")}
            </button>
          ))}
        </div>

        {/* Search & Type Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/40" />
            <input
              type="search"
              placeholder="Search lessons, adavus, mudras, or concepts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mono w-full rounded-full border border-foreground/15 bg-background/50 pl-9 pr-4 py-2 text-[11px] placeholder:text-foreground/40 focus:border-primary/60 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Formats" },
              { id: "3d", label: "3D Motion Lessons" },
              { id: "concepts", label: "Foundations & Theory" },
              { id: "completed", label: "Completed" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={`mono shrink-0 rounded-full px-3 py-1 text-[9px] uppercase tracking-wider transition-colors ${
                  selectedType === t.id
                    ? "bg-foreground/15 text-foreground font-semibold border border-foreground/30"
                    : "text-foreground/50 hover:text-foreground border border-transparent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- Curriculum Lessons Grid / List ---------------- */}
      <div className="space-y-10">
        {CURRICULUM_LEVELS.filter(
          (lvl) => selectedLevel === "all" || selectedLevel === lvl.level
        ).map((levelObj) => {
          const levelLessons = filteredLessons.filter((l) => l.level === levelObj.level);
          if (levelLessons.length === 0) return null;

          return (
            <section key={levelObj.level} className="space-y-4">
              {/* Level Section Header */}
              <div className="border-b border-foreground/12 pb-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="mono text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      Level {levelObj.level}
                    </span>
                    <h3 className="serif text-[1.4rem] leading-tight text-foreground/95">
                      {levelObj.title.replace(`Level ${levelObj.level}: `, "")}
                    </h3>
                  </div>
                  <span className="serif text-[0.92rem] italic text-foreground/50">
                    {levelObj.tagline}
                  </span>
                </div>
                <p className="serif text-[0.95rem] text-foreground/65 mt-1.5 max-w-2xl">
                  {levelObj.description}
                </p>
              </div>

              {/* Lesson Cards Grid */}
              <div className="grid gap-5 md:grid-cols-2">
                {levelLessons.map((lesson) => {
                  const isCompleted = !!progressMap[lesson.slug];
                  const href = `/learn/bharatanatyam/${lesson.slug}`;

                  return (
                    <article
                      key={lesson.id}
                      className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                        isCompleted
                          ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                          : lesson.status === "mocap-pending"
                          ? "border-amber-500/25 bg-card/60"
                          : "border-card-border bg-card/90 hover:border-primary/50"
                      }`}
                    >
                      <div>
                        {/* Top Meta Header */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-1.5">
                            {lesson.hasMotionClip ? (
                              <span className="mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-semibold flex items-center gap-1">
                                <Play className="h-2.5 w-2.5 fill-primary" />
                                3D Motion Take
                              </span>
                            ) : lesson.type === "rhythm-tala" ? (
                              <span className="mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-violet/15 text-accent-violet border border-accent-violet/30 font-medium">
                                Rhythm & Tala
                              </span>
                            ) : lesson.type === "mudra-viniyoga" ? (
                              <span className="mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 font-medium">
                                Mudra Viniyoga
                              </span>
                            ) : (
                              <span className="mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-foreground/10 text-foreground/70 border border-foreground/15 font-medium">
                                Posture Concept
                              </span>
                            )}

                            {(() => {
                              const prov = getLessonProvenance(lesson.slug);
                              if (!prov) return null;
                              if (prov.validationStatus === "source-supported") {
                                return (
                                  <span className="mono text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/90 border border-emerald-500/25">
                                    Source-Supported
                                  </span>
                                );
                              }
                              if (prov.validationStatus === "guru-review-required") {
                                return (
                                  <span className="mono text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/90 border border-amber-500/25">
                                    Guru Review Pending
                                  </span>
                                );
                              }
                              return (
                                <span className="mono text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  Mocap In Prod
                                </span>
                              );
                            })()}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="mono text-[10px] text-foreground/45 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {lesson.durationMinutes}m
                            </span>
                            {isCompleted && (
                              <span className="mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Done
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title and Subtitle */}
                        <h4 className="serif text-[1.3rem] leading-snug text-foreground/95 group-hover:text-primary transition-colors">
                          <Link href={href} className="focus:outline-none">
                            {lesson.title}
                          </Link>
                        </h4>
                        <p className="serif italic text-[0.92rem] text-foreground/55 mt-1 leading-snug">
                          {lesson.subtitle}
                        </p>

                        {/* Description */}
                        <p className="serif text-[0.94rem] leading-[1.55] text-foreground/75 mt-3 line-clamp-3">
                          {lesson.description}
                        </p>

                        {/* Key Objectives Preview */}
                        <div className="mt-4 pt-3 border-t border-foreground/10">
                          <p className="mono text-[9px] uppercase tracking-[0.16em] text-foreground/45 mb-1.5">
                            Key Focus:
                          </p>
                          <ul className="space-y-1">
                            {lesson.objectives.slice(0, 2).map((obj) => (
                              <li
                                key={obj}
                                className="serif text-[0.88rem] text-foreground/70 flex items-start gap-1.5"
                              >
                                <span className="h-1 w-1 rounded-full bg-primary mt-2 shrink-0" />
                                <span className="line-clamp-1">{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Prerequisites indicator if any */}
                        {lesson.prerequisites.length > 0 && (
                          <div className="mt-3 flex flex-wrap items-center gap-1 text-[10px] mono text-foreground/40">
                            <span>Prereq:</span>
                            {lesson.prerequisites.map((p) => (
                              <span
                                key={p.slug}
                                className={`px-1.5 py-0.2 rounded border ${
                                  progressMap[p.slug]
                                    ? "border-emerald-500/40 text-emerald-400"
                                    : "border-foreground/15 text-foreground/60"
                                }`}
                              >
                                {p.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Button */}
                      <div className="mt-5 pt-3 border-t border-foreground/10 flex items-center justify-between gap-3">
                        <span className="mono text-[9px] uppercase tracking-wider text-foreground/45">
                          {lesson.hasMotionClip
                            ? "Interactive 3D Stage"
                            : lesson.status === "mocap-pending"
                            ? "Theory & Technique Cues"
                            : "Guided Visual Concept"}
                        </span>

                        <Link
                          href={href}
                          className="mono inline-flex items-center gap-1.5 rounded-full bg-foreground/10 hover:bg-primary hover:text-black px-4 py-2 text-[10px] uppercase tracking-[0.16em] font-medium transition-colors"
                        >
                          {lesson.hasMotionClip ? (
                            <>
                              <Play className="h-3 w-3" />
                              Open Player
                            </>
                          ) : (
                            <>
                              Study Module
                              <ArrowRight className="h-3 w-3" />
                            </>
                          )}
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filteredLessons.length === 0 && (
          <div className="rounded-2xl border border-dashed border-foreground/20 p-12 text-center">
            <p className="serif text-[1.1rem] text-foreground/70">
              No curriculum lessons match your filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedLevel("all");
                setSelectedType("all");
                setSearchQuery("");
              }}
              className="mono mt-4 inline-flex items-center gap-2 rounded-full border border-primary/50 px-4 py-2 text-[10px] uppercase tracking-wider text-primary hover:bg-primary/10 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
