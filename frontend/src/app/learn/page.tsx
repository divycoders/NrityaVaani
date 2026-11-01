import type { Metadata } from "next";
import { connection } from "next/server";
import DancePicker from "@/components/learn/DancePicker";
import { Eyebrow, Headline, Prose, Rule } from "@/components/ui/editorial";
import { listLessons } from "@/lib/lesson/store";

export const metadata: Metadata = {
  title: "Learn Classical Dance | 3D Virtual Guru | NrityaVaani",
  description: "Learn Bharatanatyam and Indian classical dance step-by-step with an interactive 3D Virtual Guru.",
};

/**
 * The front door of `/learn`: the classical dance curriculum.
 *
 * Lessons are filed under a dance and taught as its parts, guided by the
 * interactive 3D Virtual Guru.
 */
export default async function LearnPage() {
  await connection();
  const parts: Record<string, number> = {};
  for (const lesson of await listLessons()) {
    parts[lesson.dance] = (parts[lesson.dance] ?? 0) + 1;
  }

  return (
    <div className="px-6 pt-32 pb-24 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow tone="primary">teaching-first curriculum</Eyebrow>
            <span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground/40">
              3d virtual guru &middot; zero camera requirement
            </span>
          </div>
          <Headline as="h1" className="mt-3">
            The Classical Curriculum
          </Headline>
          <Prose className="mt-4">
            <p>
              Explore the classical traditions of India through interactive 3D Guru instruction.
              Choose a dance form to learn its foundational parts, inspect movements from any camera
              angle at your own pace, and listen to authentic spoken cues across 12 languages.
            </p>
          </Prose>
        </header>

        <Rule className="mt-10" />

        <div className="mt-10">
          <DancePicker parts={parts} />
        </div>
      </div>
    </div>
  );
}
