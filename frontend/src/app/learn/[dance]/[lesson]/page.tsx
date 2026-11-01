import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import VirtualClassroom from "@/components/learn/VirtualClassroom";
import { DANCES } from "@/lib/constants/dances";
import { listLessons } from "@/lib/lesson/store";
import { getLessonBySlug } from "@/lib/curriculum/curriculumData";

type Props = { params: Promise<{ dance: string; lesson: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dance: danceSlug, lesson: slug } = await params;
  const lesson = (await listLessons()).find((l) => l.slug === slug);
  const dance = DANCES.find((d) => d.slug === (lesson?.dance || danceSlug));
  const curr = getLessonBySlug(slug);

  if (curr) {
    return {
      title: `${curr.title} · ${dance?.name ?? "Bharatanatyam"} | NrityaVaani Virtual Classroom`,
      description: curr.subtitle,
    };
  }

  return lesson && dance ? { title: `${lesson.title} · ${dance.name} | NrityaVaani Virtual Classroom` } : {};
}

/**
 * Voice-Led 3D Virtual Classroom for all curriculum lessons and motion modules.
 *
 * The 3D Virtual Guru acts as the primary teacher across all lessons:
 * - 8-chapter pedagogical sequence (Guru Intro, Foundation, Demonstration, Technique, Safety, Recap, Quiz, Next)
 * - Structured voice narration via Goonj Neural TTS & Vernacular speech
 * - Authentic 3D motion playback, 3D posture geometry, or concept visualizers
 * - Dynamic lesson-grounded Guru conversational assistance
 */
export default async function LessonPage({ params }: Props) {
  await connection();
  const { dance: danceSlug, lesson: slug } = await params;

  const lessons = await listLessons();
  const lesson = lessons.find((l) => l.slug === slug);
  if (lesson && lesson.dance !== danceSlug) {
    redirect(`/learn/${lesson.dance}/${lesson.slug}`);
  }

  const dance = DANCES.find((d) => d.slug === danceSlug);
  const part = lesson ? lessons.filter((l) => l.dance === lesson.dance).indexOf(lesson) + 1 : null;

  return (
    <VirtualClassroom
      lessonSlug={slug}
      dance={dance ? { slug: dance.slug, name: dance.name } : null}
      part={part}
    />
  );
}
