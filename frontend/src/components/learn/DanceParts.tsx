import PartRow from "@/components/learn/PartRow";
import type { Dance } from "@/lib/constants/dances";
import type { LessonSummary } from "@/lib/lesson/manifest";

/**
 * A dance's lessons in order, as its parts.
 *
 * Taught sequentially with the interactive 3D Virtual Guru.
 */
export default function DanceParts({
  dance,
  lessons,
  className = "",
}: {
  dance: Pick<Dance, "slug" | "name">;
  /** This dance's lessons, already in part order. */
  lessons: LessonSummary[];
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-foreground/12 pb-3">
        <h2 className="serif text-[1.8rem] leading-tight">Parts</h2>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-foreground/45">
          Step-by-step 3D lessons · Camera optional
        </span>
      </div>

      {lessons.length === 0 ? (
        <div className="mt-5 rounded-sm border border-dashed border-foreground/20 px-6 py-14 text-center">
          <p className="serif text-[1.15rem] text-foreground/70">
            No parts for {dance.name} yet.
          </p>
          <p className="serif mt-2 text-foreground/45">New parts appear here as they are published.</p>
        </div>
      ) : (
        <ol className="mt-1">
          {lessons.map((lesson, i) => (
            <li key={lesson.slug}>
              <PartRow lesson={lesson} part={i + 1} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
