/**
 * Knowledge Retriever for the 3D Virtual Guru.
 *
 * Lightweight, deterministic, and fuzzy search over:
 * 1. BHARATANATYAM_CURRICULUM (6 levels, 13 verified lessons)
 * 2. CURRICULUM_PROVENANCE (source texts, validation status, tradition)
 * 3. MUDRAS (28 gestures in digital library: 18 single-hand, 10 combined)
 * 4. ACTIVE STEP CONTEXT (step index, name, gloss, technique cues)
 *
 * Grounded strictly in repository content without external hallucinations.
 */

import {
  BHARATANATYAM_CURRICULUM,
  getLessonBySlug,
  type CurriculumLesson,
} from "../curriculum/curriculumData.ts";
import {
  getLessonProvenance,
  type ContentProvenance,
  type ValidationStatus,
} from "../curriculum/provenance.ts";
import { MUDRAS } from "../constants/mudras.ts";

export interface MudraRecord {
  id: string;
  slug: string;
  name: string;
  category: string;
  meaning: string;
  meaningLong?: string;
  significance?: string;
  instructions?: string;
  commonMistakes?: string;
}

export interface StepContext {
  index: number;
  name: string;
  gloss?: string;
  cues?: string[];
}

export interface RetrievedContext {
  query: string;
  currentLesson?: CurriculumLesson;
  currentStep?: StepContext;
  matchedLessons: CurriculumLesson[];
  matchedMudras: MudraRecord[];
  primaryProvenance?: ContentProvenance;
  validationStatus: ValidationStatus;
  statusLabel: string;
  tradition: string;
  safetyAdvisory?: string;
  isOutOfScope: boolean;
  relatedLinks: { title: string; href: string; type: "lesson" | "mudra" | "curriculum" }[];
}

/** Stop words filtered from query tokens */
const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "by", "from",
  "is", "are", "was", "were", "what", "how", "why", "where", "can", "you",
  "tell", "me", "about", "explain", "meaning", "please", "i", "do", "does",
  "this", "that", "these", "those", "different", "difference", "between"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Retrieves grounded context for a user question.
 *
 * @param query - The learner's text question.
 * @param currentLessonSlug - Optional slug of the lesson the learner is actively studying.
 * @param conversationHistory - Recent conversation turns for follow-up resolution.
 * @param currentStep - Optional active movement step metadata during 3D demonstration.
 */
export function retrieveGroundedKnowledge(
  query: string,
  currentLessonSlug?: string,
  _conversationHistory: { role: "user" | "guru"; text: string }[] = [],
  currentStep?: StepContext
): RetrievedContext {
  const normalizedQuery = query.toLowerCase().trim();
  const tokens = tokenize(normalizedQuery);

  // 1. Resolve context if learner asks a follow-up or step-specific question
  const isFollowUp =
    /again|simply|simple|more slowly|slower|did not understand|repeat|what next|next step|continue|more detail|this step|current step|this movement|hands|rhythm/i.test(
      normalizedQuery
    );

  let activeLesson: CurriculumLesson | undefined;
  if (currentLessonSlug) {
    activeLesson = getLessonBySlug(currentLessonSlug);
  }

  // 2. Mudra matching
  const matchedMudras: MudraRecord[] = [];
  for (const mudra of MUDRAS) {
    const mudraTokens = tokenize(`${mudra.name} ${mudra.slug} ${mudra.meaning}`);
    const nameMatch = normalizedQuery.includes(mudra.name.toLowerCase()) || normalizedQuery.includes(mudra.slug.toLowerCase());
    const tokenOverlap = tokens.filter((t) => mudraTokens.includes(t)).length;

    if (nameMatch || tokenOverlap >= 2) {
      matchedMudras.push({
        id: mudra.id,
        slug: mudra.slug,
        name: mudra.name,
        category: mudra.category,
        meaning: mudra.meaning,
        meaningLong: mudra.meaningLong,
        significance: mudra.significance,
        instructions: mudra.instructions,
        commonMistakes: mudra.commonMistakes,
      });
    }
  }

  // 3. Lesson matching
  const lessonScores: { lesson: CurriculumLesson; score: number }[] = [];
  for (const lesson of BHARATANATYAM_CURRICULUM) {
    let score = 0;
    const lessonSlugLower = lesson.slug.toLowerCase();

    // Exact name in query gets strong weight
    if (normalizedQuery.includes(lessonSlugLower) || normalizedQuery.includes(lesson.title.toLowerCase())) {
      score += 25;
    }

    // Specific key classical terms
    if (normalizedQuery.includes("aramandi") && lesson.slug === "samapada-and-aramandi") score += 18;
    if (normalizedQuery.includes("samapada") && lesson.slug === "samapada-and-aramandi") score += 18;
    if (normalizedQuery.includes("muzhumandi") && lesson.slug === "samapada-and-aramandi") score += 18;
    if (normalizedQuery.includes("namaskaram") && lesson.slug === "namaskaram") score += 20;
    if (normalizedQuery.includes("thattadavu") && lesson.slug === "thattadavu") score += 20;
    if (normalizedQuery.includes("tatta adavu") && lesson.slug === "thattadavu") score += 20;
    if (normalizedQuery.includes("natta adavu") && lesson.slug === "natta-adavu") score += 25;
    if (normalizedQuery.includes("nattadavu") && lesson.slug === "natta-adavu") score += 25;
    if (normalizedQuery.includes("adi tala") && lesson.slug === "adi-tala-and-rhythm") score += 18;
    if (normalizedQuery.includes("sollukattu") && lesson.slug === "sollukattu-art") score += 18;
    if (normalizedQuery.includes("natyarambha") && lesson.slug === "basic-hand-positions") score += 18;
    if (normalizedQuery.includes("nritta") && lesson.slug === "intro-bharatanatyam") score += 12;
    if (normalizedQuery.includes("nritya") && lesson.slug === "intro-bharatanatyam") score += 12;
    if (normalizedQuery.includes("natya") && lesson.slug === "intro-bharatanatyam") score += 12;
    if (normalizedQuery.includes("ghungroo") && lesson.slug === "attire-and-environment") score += 14;
    if (normalizedQuery.includes("salangai") && lesson.slug === "attire-and-environment") score += 14;
    if (normalizedQuery.includes("alta") && lesson.slug === "attire-and-environment") score += 14;
    if (normalizedQuery.includes("revision") && lesson.slug === "daily-revision-routine") score += 12;
    if (normalizedQuery.includes("routine") && lesson.slug === "daily-revision-routine") score += 12;
    if (normalizedQuery.includes("anga shuddhi") && lesson.slug === "curriculum-assessment-guide") score += 14;
    if (normalizedQuery.includes("assessment") && lesson.slug === "curriculum-assessment-guide") score += 12;

    // Token overlap across concepts and technique cues
    const lessonSearchText = `${lesson.title} ${lesson.subtitle} ${lesson.description} ${lesson.keyConcepts.map((k) => `${k.title} ${k.explanation}`).join(" ")} ${lesson.techniqueCues.join(" ")}`;
    const lessonTokens = tokenize(lessonSearchText);
    const overlap = tokens.filter((t) => lessonTokens.includes(t)).length;
    score += overlap * 2;

    // Active lesson context prioritization:
    // Boost currently active lesson so stale context from past turns does not override the current lesson
    if (activeLesson && lesson.slug === activeLesson.slug) {
      score += isFollowUp ? 20 : 10;
    }

    if (score > 3) {
      lessonScores.push({ lesson, score });
    }
  }

  lessonScores.sort((a, b) => b.score - a.score);
  const matchedLessons = lessonScores.slice(0, 3).map((ls) => ls.lesson);

  // If no lesson matched but activeLesson exists and it's a follow-up or short query, use activeLesson
  if (matchedLessons.length === 0 && activeLesson && (isFollowUp || tokens.length <= 2)) {
    matchedLessons.push(activeLesson);
  }

  // 4. Determine Out of Scope status
  // Common classical dance keywords in syllabus
  const DANCE_KEYWORDS = [
    "bharatanatyam", "dance", "adavu", "mudra", "hasta", "tala", "kalam", "speed",
    "aramandi", "samapada", "muzhumandi", "namaskaram", "pranam", "guru", "shloka",
    "natyarambha", "thattadavu", "natta", "sol", "sollukattu", "pataka", "tripataka",
    "ardhapataka", "kartarimukha", "mayura", "anjali", "kapota", "karkata", "swastika",
    "chaturam", "alapadma", "step", "rhythm", "hand", "finger", "knee", "posture",
    "feet", "strike", "leg", "heel", "turnout", "sadhana", "abhyasa", "routine",
    "curriculum", "learn", "bani", "kalakshetra", "tanjavur", "pandanallur",
    "observe", "position", "movement", "cues", "view", "angle"
  ];

  const hasDanceKeyword = tokens.some((t) =>
    DANCE_KEYWORDS.some((kw) => kw.includes(t) || t.includes(kw))
  );

  const isOutOfScope =
    matchedLessons.length === 0 &&
    matchedMudras.length === 0 &&
    !currentStep &&
    !hasDanceKeyword &&
    !isFollowUp &&
    tokens.length > 0;

  // 5. Select primary lesson & provenance
  const primaryLesson = matchedLessons[0] || activeLesson;
  let primaryProvenance: ContentProvenance | undefined;
  if (primaryLesson) {
    primaryProvenance = getLessonProvenance(primaryLesson.slug);
  }

  const validationStatus: ValidationStatus =
    primaryProvenance?.validationStatus ??
    (primaryLesson?.needsGuruReview ? "guru-review-required" : "source-supported");

  const statusLabel =
    primaryProvenance?.statusLabel ??
    (validationStatus === "in-production"
      ? "Mocap In Production"
      : validationStatus === "guru-review-required"
      ? "Guru Review Pending"
      : "Source-Supported");

  const tradition = primaryProvenance?.tradition ?? "General / Pan-Bharatanatyam";
  const safetyAdvisory = primaryLesson?.safetyAdvisory || primaryProvenance?.safetyAdvisory;

  // 6. Build related navigation links
  const relatedLinks: RetrievedContext["relatedLinks"] = [];
  for (const m of matchedMudras.slice(0, 2)) {
    relatedLinks.push({
      title: `${m.name} Hasta`,
      href: `/library/${m.slug}`,
      type: "mudra",
    });
  }
  for (const l of matchedLessons.slice(0, 2)) {
    relatedLinks.push({
      title: l.title,
      href: `/learn/bharatanatyam/${l.slug}`,
      type: "lesson",
    });
  }

  // Suggest next lesson if user asks what to learn next
  if (/next|after this|continue|progression/i.test(normalizedQuery) && primaryLesson?.nextLessonSlug) {
    const nextLesson = getLessonBySlug(primaryLesson.nextLessonSlug);
    if (nextLesson) {
      relatedLinks.unshift({
        title: `Next Up: ${nextLesson.title}`,
        href: `/learn/bharatanatyam/${nextLesson.slug}`,
        type: "lesson",
      });
    }
  }

  return {
    query,
    currentLesson: activeLesson,
    currentStep,
    matchedLessons,
    matchedMudras,
    primaryProvenance,
    validationStatus,
    statusLabel,
    tradition,
    safetyAdvisory,
    isOutOfScope,
    relatedLinks,
  };
}
