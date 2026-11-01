"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { StatsService, type PracticeSession } from "@/lib/services/StatsService";
import {
  CurriculumProgressService,
  type LessonProgress,
} from "@/lib/services/CurriculumProgressService";
import {
  BHARATANATYAM_CURRICULUM,
  CURRICULUM_LEVELS,
  type CurriculumLesson,
} from "@/lib/curriculum/curriculumData";
import { MUDRAS } from "@/lib/constants/mudras";
import { Eyebrow, Rule } from "@/components/ui/editorial";
import { cn } from "@/lib/utils";

/** A mudra counts as held once you have cleared this in a session. */
const MASTERY = 90;

const TABS = ["Overview", "Curriculum", "History", "Mastered", "Account"] as const;
type Tab = (typeof TABS)[number];

export default function DashboardPage() {
  const { data: auth } = useSession();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [curriculumProgress, setCurriculumProgress] = useState<Record<string, LessonProgress>>({});
  const [tab, setTab] = useState<Tab>("Overview");
  const [showAccount, setShowAccount] = useState(false);

  useEffect(() => {
    let stored = StatsService.getSessions();

    if (auth?.user?.email === "demo@example.com" && stored.length === 0) {
      [
        { mudraId: "mayura", mudraName: "Mayura", accuracy: 98, duration: 300 },
        { mudraId: "ardhapataka", mudraName: "Ardhapataka", accuracy: 95, duration: 200 },
        { mudraId: "pataka", mudraName: "Pataka", accuracy: 92, duration: 120 },
        { mudraId: "tripataka", mudraName: "Tripataka", accuracy: 88, duration: 45 },
        { mudraId: "kartarimukha", mudraName: "Kartarimukha", accuracy: 85, duration: 60 },
      ].forEach((d) => StatsService.saveSession(d));
      stored = StatsService.getSessions();
    }

    setSessions(stored);
    setCurriculumProgress(CurriculumProgressService.getAllProgress());
  }, [auth]);

  const firstName = auth?.user?.name?.split(" ")[0] ?? "there";
  const mastered = useMemo(() => sessions.filter((s) => s.accuracy >= MASTERY), [sessions]);

  // Curriculum completion statistics
  const completedCurriculumCount = useMemo(() => {
    return BHARATANATYAM_CURRICULUM.filter((l) => curriculumProgress[l.slug]?.completed).length;
  }, [curriculumProgress]);

  const curriculumPercent = Math.round(
    (completedCurriculumCount / BHARATANATYAM_CURRICULUM.length) * 100
  );

  // Next recommended lesson or resume lesson
  const currentOrNextLesson = useMemo(() => {
    // 1. Most recently visited incomplete lesson
    const visitedIncomplete = Object.values(curriculumProgress)
      .filter((p) => !p.completed)
      .sort((a, b) => b.lastVisited - a.lastVisited)[0];

    if (visitedIncomplete) {
      const found = BHARATANATYAM_CURRICULUM.find((l) => l.slug === visitedIncomplete.lessonId);
      if (found) return { lesson: found, reason: "Resume where you left off" };
    }

    // 2. First uncompleted lesson in sequential order
    const nextUncompleted = BHARATANATYAM_CURRICULUM.find(
      (l) => !curriculumProgress[l.slug]?.completed
    );
    if (nextUncompleted) {
      return { lesson: nextUncompleted, reason: "Next sequential module" };
    }

    // 3. If all completed, recommend Namaskaram for daily revision
    return {
      lesson: BHARATANATYAM_CURRICULUM[0],
      reason: "Revise daily foundations",
    };
  }, [curriculumProgress]);

  /**
   * What to do next in the curriculum and practice.
   */
  const suggestions = useMemo(() => {
    const out: { title: string; body: string; href: string }[] = [];

    // Curriculum recommendation
    if (currentOrNextLesson) {
      out.push({
        title: currentOrNextLesson.lesson.title,
        body: `${currentOrNextLesson.reason} · ${currentOrNextLesson.lesson.levelName}`,
        href: `/learn/bharatanatyam/${currentOrNextLesson.lesson.slug}`,
      });
    }

    // Practice suggestions based on recorded sessions
    const close = sessions
      .filter((s) => s.accuracy >= 75 && s.accuracy < MASTERY)
      .sort((a, b) => b.accuracy - a.accuracy)[0];
    if (close) {
      out.push({
        title: `Optional: Polish ${close.mudraName}`,
        body: `Your best accuracy is ${close.accuracy}%. ${MASTERY}% marks mastery.`,
        href: `/practice/${close.mudraId}`,
      });
    }

    const practised = new Set(sessions.map((s) => s.mudraId));
    const untouched = MUDRAS.find((m) => !practised.has(m.slug));
    if (untouched) {
      out.push({
        title: `Explore ${untouched.name} Mudra`,
        body: `${untouched.meaning}. Documented in the 3D mudra library.`,
        href: `/library/${untouched.slug}`,
      });
    }

    return out.slice(0, 3);
  }, [currentOrNextLesson, sessions]);

  return (
    <div className="min-h-screen px-6 pt-32 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <Eyebrow tone="primary">learner dashboard</Eyebrow>
            <h1 className="serif font-normal tracking-[-0.015em] leading-[1.08] text-[clamp(1.9rem,4.4vw,3rem)] mt-4">
              Welcome back, {firstName}.
            </h1>
            <p className="serif text-[1.02rem] leading-[1.6] text-foreground/60 mt-3 max-w-[52ch]">
              Track your 3D Guru curriculum progress, daily sadhana, and optional mudra mastery —
              all stored privately in this browser.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setShowAccount(false);
                }}
                aria-current={tab === t ? "page" : undefined}
                className={cn(
                  "mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                  tab === t ? "text-primary font-semibold" : "text-foreground/45 hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        <Rule className="mt-10 mb-12" />

        {/* ================= OVERVIEW TAB ================= */}
        {tab === "Overview" && (
          <div className="space-y-12">
            {/* Top Curriculum Progress Banner */}
            <div className="rounded-2xl border border-card-border bg-card/80 p-6 shadow-sm">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] items-center">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="mono text-[10px] uppercase tracking-[0.2em] text-primary">
                      Bharatanatyam Curriculum
                    </span>
                    <span className="text-foreground/30">·</span>
                    <span className="mono text-[10px] uppercase tracking-wider text-foreground/50">
                      6 Progressive Levels
                    </span>
                  </div>
                  <h3 className="serif text-[1.4rem] leading-tight text-foreground/95">
                    {completedCurriculumCount === 0
                      ? "Begin Your Classical Dance Journey"
                      : `${completedCurriculumCount} of ${BHARATANATYAM_CURRICULUM.length} Curriculum Modules Mastered`}
                  </h3>
                  <p className="serif text-[0.96rem] leading-[1.58] text-foreground/65 mt-2">
                    {completedCurriculumCount === 0
                      ? "Start with Level 1: Introduction to learn the spiritual roots and sacred preparation, then proceed to the 3D Guru's posture drills."
                      : `You have completed ${curriculumPercent}% of the foundational syllabus. Regular revision of Namaskaram and Thattadavu strengthens muscle memory.`}
                  </p>
                </div>

                <div className="rounded-xl border border-foreground/12 bg-foreground/[0.02] p-4.5 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="mono text-[10px] uppercase tracking-wider text-foreground/50">
                      Curriculum Progress
                    </span>
                    <span className="mono text-[12px] font-semibold text-primary">
                      {curriculumPercent}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-foreground/10 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500 rounded-full"
                      style={{ width: `${curriculumPercent}%` }}
                    />
                  </div>

                  {currentOrNextLesson && (
                    <div className="pt-2 border-t border-foreground/10 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="mono text-[9px] uppercase tracking-wider text-primary">
                          {currentOrNextLesson.reason}:
                        </p>
                        <p className="serif text-[0.95rem] font-medium text-foreground/90 truncate">
                          {currentOrNextLesson.lesson.title}
                        </p>
                      </div>
                      <Link
                        href={`/learn/bharatanatyam/${currentOrNextLesson.lesson.slug}`}
                        className="mono shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[10px] uppercase tracking-wider text-black font-semibold hover:bg-primary/85 transition-colors shadow-sm"
                      >
                        {completedCurriculumCount === 0 ? "Begin" : "Study"} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* General Practice Statistics */}
            <DashboardStats />

            {/* Split Section: What To Do Next vs Recent Practice */}
            <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-10 lg:gap-14">
              <section>
                <Eyebrow>suggested next steps</Eyebrow>
                {suggestions.length > 0 ? (
                  <ul className="mt-6 space-y-3">
                    {suggestions.map((s) => (
                      <li
                        key={s.title}
                        className="rounded-xl border border-foreground/12 bg-card/60 p-4 transition-colors hover:border-primary/50"
                      >
                        <Link href={s.href} className="block group">
                          <p className="text-[1.02rem] font-medium text-foreground/95 group-hover:text-primary transition-colors">
                            {s.title}
                          </p>
                          <p className="serif text-[0.92rem] leading-[1.5] text-foreground/60 mt-1">
                            {s.body}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="serif italic text-[0.98rem] text-foreground/45 mt-6">
                    Start a lesson or explore mudras in the library.
                  </p>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between">
                  <Eyebrow>recent camera sessions</Eyebrow>
                  <span className="mono text-[9px] uppercase tracking-wider text-foreground/40">
                    Optional Practice
                  </span>
                </div>
                <SessionList sessions={sessions.slice(0, 5)} empty="No camera practice sessions yet." />
              </section>
            </div>
          </div>
        )}

        {/* ================= CURRICULUM TAB ================= */}
        {tab === "Curriculum" && (
          <div className="space-y-12">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-foreground/12 pb-4">
              <div>
                <Eyebrow tone="primary">curriculum journey</Eyebrow>
                <h2 className="serif text-[1.8rem] leading-tight mt-2 text-foreground/95">
                  Your Bharatanatyam Syllabus
                </h2>
              </div>
              <span className="mono text-[11px] text-primary font-medium">
                {completedCurriculumCount} of {BHARATANATYAM_CURRICULUM.length} Completed
              </span>
            </div>

            <div className="space-y-10">
              {CURRICULUM_LEVELS.map((lvl) => {
                const lessons = BHARATANATYAM_CURRICULUM.filter((l) => l.level === lvl.level);
                return (
                  <div key={lvl.level} className="space-y-4">
                    <div className="flex items-baseline justify-between border-b border-foreground/10 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="mono text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
                          Level {lvl.level}
                        </span>
                        <h3 className="serif text-[1.25rem] font-medium text-foreground/90">
                          {lvl.title.replace(`Level ${lvl.level}: `, "")}
                        </h3>
                      </div>
                      <span className="serif text-[0.88rem] italic text-foreground/50">
                        {lvl.tagline}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {lessons.map((lesson) => {
                        const isDone = !!curriculumProgress[lesson.slug]?.completed;
                        const href = `/learn/bharatanatyam/${lesson.slug}`;

                        return (
                          <div
                            key={lesson.id}
                            className={`rounded-xl border p-4 flex flex-col justify-between transition-colors ${
                              isDone
                                ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                                : "border-card-border bg-card/60 hover:border-primary/40"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="mono text-[9px] uppercase tracking-wider text-foreground/50">
                                  {lesson.hasMotionClip ? "3D Motion" : "Theory / Concept"} · {lesson.durationMinutes}m
                                </span>
                                {isDone ? (
                                  <span className="mono text-[9px] uppercase text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Done
                                  </span>
                                ) : (
                                  <span className="mono text-[9px] uppercase text-foreground/40">
                                    Not Completed
                                  </span>
                                )}
                              </div>
                              <h4 className="serif text-[1.15rem] leading-snug font-medium text-foreground/95">
                                <Link href={href} className="hover:text-primary transition-colors">
                                  {lesson.title}
                                </Link>
                              </h4>
                              <p className="serif text-[0.88rem] leading-normal text-foreground/60 mt-1 line-clamp-2">
                                {lesson.subtitle}
                              </p>
                            </div>

                            <div className="mt-4 pt-2.5 border-t border-foreground/10 flex items-center justify-between">
                              <span className="mono text-[9px] uppercase tracking-wider text-foreground/40">
                                {lesson.hasMotionClip ? "Interactive Stage" : "Concept Guide"}
                              </span>
                              <Link
                                href={href}
                                className="mono inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary hover:underline"
                              >
                                {isDone ? "Review" : "Open"} <ArrowRight className="h-2.5 w-2.5" />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= HISTORY TAB ================= */}
        {tab === "History" && (
          <section>
            <Eyebrow>every camera session</Eyebrow>
            <SessionList sessions={sessions} empty="No sessions recorded yet." />
          </section>
        )}

        {/* ================= MASTERED TAB ================= */}
        {tab === "Mastered" && (
          <section>
            <Eyebrow>held above {MASTERY}% in camera practice</Eyebrow>
            {mastered.length > 0 ? (
              <SessionList sessions={mastered} empty="" />
            ) : (
              <p className="serif italic text-[0.98rem] text-foreground/45 mt-6">
                No mudras mastered above {MASTERY}% yet. Self-practice is optional.
              </p>
            )}
          </section>
        )}

        {/* ================= ACCOUNT TAB ================= */}
        {tab === "Account" && (
          <section className="max-w-2xl">
            {!showAccount ? (
              <>
                <Eyebrow>account</Eyebrow>
                <h2 className="serif text-[1.8rem] leading-tight tracking-tight mt-4">
                  {auth?.user?.name ?? "Not signed in"}
                </h2>
                <p className="mono text-[11px] text-foreground/45 mt-2">
                  {auth?.user?.email ?? "—"}
                </p>

                <Rule className="my-9" />

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowAccount(true)}
                    className="w-full flex items-center justify-between py-4 border-t border-foreground/12 group"
                  >
                    <span className="mono text-[11px] uppercase tracking-[0.16em] text-foreground/70 group-hover:text-primary transition-colors">
                      Account details
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-foreground/30 group-hover:text-primary transition-colors" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          "Reset all learning progress and practice history stored in this browser? This cannot be undone."
                        )
                      ) {
                        StatsService.clearAll();
                        CurriculumProgressService.reset();
                        setSessions([]);
                        setCurriculumProgress({});
                      }
                    }}
                    className="w-full text-left py-4 border-t border-foreground/12"
                  >
                    <span className="mono text-[11px] uppercase tracking-[0.16em] text-rose-400">
                      Reset curriculum & practice history
                    </span>
                    <span className="block serif text-[0.92rem] text-foreground/50 mt-1.5">
                      Removes every session and lesson progress record from this browser.
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowAccount(false)}
                  className="mono inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-foreground/45 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Account
                </button>
                <h2 className="serif text-[1.8rem] leading-tight tracking-tight mt-6">
                  Account details
                </h2>
                <dl className="mt-8">
                  <Detail label="name" value={auth?.user?.name ?? "—"} />
                  <Detail label="email" value={auth?.user?.email ?? "—"} />
                  <Detail
                    label="signed in with"
                    value={auth?.user?.email === "demo@example.com" ? "Demo account" : "Google"}
                  />
                  <Detail label="history stored in" value="This browser only" />
                </dl>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3.5 border-t border-foreground/12">
      <dt className="mono text-[10px] uppercase tracking-[0.18em] text-foreground/45">{label}</dt>
      <dd className="text-[0.98rem] text-foreground/85 text-right">{value}</dd>
    </div>
  );
}

function SessionList({ sessions, empty }: { sessions: PracticeSession[]; empty: string }) {
  if (sessions.length === 0) {
    return <p className="serif italic text-[0.98rem] text-foreground/45 mt-6">{empty}</p>;
  }
  return (
    <ul className="mt-6">
      {sessions.map((s) => (
        <li key={s.id} className="border-t border-foreground/12">
          <Link
            href={`/library/${s.mudraId}`}
            className="flex items-center justify-between gap-6 py-4 group"
          >
            <div className="min-w-0">
              <p className="text-[1rem] font-medium group-hover:text-primary transition-colors truncate">
                {s.mudraName}
              </p>
              <p className="mono text-[10px] uppercase tracking-[0.14em] text-foreground/40 mt-1.5">
                {formatDistanceToNow(s.timestamp)} ago · {Math.floor(s.duration)}s
              </p>
            </div>
            <span className="mono text-[1.15rem] tabular-nums text-foreground/85 shrink-0">
              {s.accuracy}%
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
