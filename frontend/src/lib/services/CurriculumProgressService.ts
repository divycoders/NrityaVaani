"use client";

/**
 * CurriculumProgressService: Manages local progression through the
 * Bharatanatyam curriculum.
 *
 * Persisted in browser localStorage without requiring a remote database.
 * Preserves privacy while remembering which lessons the learner has explored,
 * completed, or needs to revise.
 */

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: number;
  lastVisited: number;
  lastStep?: number;
  currentChapter?: number;
  maxChapterReached?: number;
  quizAnswered?: boolean;
}

const STORAGE_KEY = "nv_curriculum_progress";

export class CurriculumProgressService {
  /** Retrieves all saved lesson progress records */
  static getAllProgress(): Record<string, LessonProgress> {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /** Gets progress for a specific lesson slug */
  static getProgress(lessonId: string): LessonProgress | null {
    const all = this.getAllProgress();
    return all[lessonId] ?? null;
  }

  /** Returns whether a specific lesson has been completed */
  static isCompleted(lessonId: string): boolean {
    const p = this.getProgress(lessonId);
    return !!p?.completed;
  }

  /** Records that the learner opened or continued a lesson */
  static recordVisit(lessonId: string, step?: number): void {
    if (typeof window === "undefined" || !lessonId) return;
    try {
      const all = this.getAllProgress();
      const existing = all[lessonId] || {
        lessonId,
        completed: false,
        lastVisited: Date.now(),
      };

      all[lessonId] = {
        ...existing,
        lastVisited: Date.now(),
        ...(typeof step === "number" ? { lastStep: step } : {}),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // Ignore localStorage write failures (e.g. private browsing quota)
    }
  }

  /** Records that the learner reached a specific chapter in the lesson */
  static recordChapter(lessonId: string, chapterIndex: number): void {
    if (typeof window === "undefined" || !lessonId) return;
    try {
      const all = this.getAllProgress();
      const existing = all[lessonId] || {
        lessonId,
        completed: false,
        lastVisited: Date.now(),
      };

      const maxChapter = Math.max(existing.maxChapterReached ?? 0, chapterIndex);

      all[lessonId] = {
        ...existing,
        lastVisited: Date.now(),
        currentChapter: chapterIndex,
        maxChapterReached: maxChapter,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }

  /** Records that the formative understanding check was answered */
  static recordQuizAnswered(lessonId: string): void {
    if (typeof window === "undefined" || !lessonId) return;
    try {
      const all = this.getAllProgress();
      const existing = all[lessonId] || {
        lessonId,
        completed: false,
        lastVisited: Date.now(),
      };

      all[lessonId] = {
        ...existing,
        quizAnswered: true,
        lastVisited: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }

  /** Gets chapter progression for a specific lesson */
  static getChapterProgress(lessonId: string): {
    currentChapter: number;
    maxChapterReached: number;
    quizAnswered: boolean;
  } {
    const p = this.getProgress(lessonId);
    return {
      currentChapter: p?.currentChapter ?? 0,
      maxChapterReached: p?.maxChapterReached ?? 0,
      quizAnswered: p?.quizAnswered ?? false,
    };
  }

  /** Marks a lesson as fully completed */
  static markCompleted(lessonId: string): void {
    if (typeof window === "undefined" || !lessonId) return;
    try {
      const all = this.getAllProgress();
      const existing = all[lessonId] || {
        lessonId,
        completed: false,
        lastVisited: Date.now(),
      };

      all[lessonId] = {
        ...existing,
        completed: true,
        completedAt: existing.completedAt || Date.now(),
        lastVisited: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // Ignore localStorage write failures
    }
  }

  /** Removes completion status from a lesson while preserving visit history */
  static unmarkCompleted(lessonId: string): void {
    if (typeof window === "undefined" || !lessonId) return;
    try {
      const all = this.getAllProgress();
      if (!all[lessonId]) return;
      all[lessonId] = {
        ...all[lessonId],
        completed: false,
        completedAt: undefined,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {
      // Ignore localStorage write failures
    }
  }

  /** Counts total number of completed curriculum lessons */
  static getCompletedCount(): number {
    const all = this.getAllProgress();
    return Object.values(all).filter((p) => p.completed).length;
  }

  /** Returns the most recently visited incomplete lesson slug to resume */
  static getResumeLessonSlug(availableSlugs: string[]): string | null {
    const all = this.getAllProgress();
    const sorted = Object.values(all)
      .filter((p) => !p.completed && availableSlugs.includes(p.lessonId))
      .sort((a, b) => b.lastVisited - a.lastVisited);

    return sorted.length > 0 ? sorted[0].lessonId : null;
  }

  /** Clears all curriculum progress (for testing or reset) */
  static reset(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}
