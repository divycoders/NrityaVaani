/**
 * Guru Conversational Assistant Endpoint (Authoritative Production Path)
 *
 * Server-side route providing grounded pedagogical answers using the
 * NrityaVaani curriculum, mudra definitions, and provenance registry.
 *
 * Privacy & Security:
 * - Credentials never exposed to client code.
 * - Strict input validation: query length <= 500 chars, null-byte sanitization.
 * - History sanitization: session-only, max 6 turns, max 1000 chars per turn.
 * - Active movement step context sanitization for 3D demonstration questions.
 * - No webcam frames, learner video, or biometric data accepted or processed.
 * - Internal provider errors are masked; never leaks secrets or stack traces.
 */

import { NextResponse } from "next/server";
import { retrieveGroundedKnowledge, type StepContext } from "@/lib/guru/knowledgeRetriever";
import { synthesizeGuruAnswer } from "@/lib/guru/guruSynthesizer";

interface ChatRequestBody {
  message: string;
  currentLessonSlug?: string;
  currentStep?: {
    index: number;
    name: string;
    gloss?: string;
    cues?: string[];
  };
  history?: { role: "user" | "guru"; text: string }[];
  persona?: string;
  lang?: string;
  provider?: "deepseek" | "claude";
}

export async function POST(request: Request) {
  try {
    let body: ChatRequestBody;
    try {
      body = (await request.json()) as ChatRequestBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    // 1. Validate message input (must be string, non-empty, without null bytes)
    if (!body || typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json(
        { error: "Question cannot be empty. Please ask a Bharatanatyam question." },
        { status: 400 }
      );
    }

    const sanitizedQuery = body.message.replace(/\0/g, "").trim();

    // 2. Length limit check (protects against excessively long queries and abuse)
    if (sanitizedQuery.length > 500) {
      return NextResponse.json(
        { error: "Question exceeds the maximum length of 500 characters. Please ask a more concise question." },
        { status: 400 }
      );
    }

    // 3. Validate and sanitize currentLessonSlug
    let safeLessonSlug: string | undefined;
    if (typeof body.currentLessonSlug === "string") {
      const trimmedSlug = body.currentLessonSlug.trim().toLowerCase();
      if (/^[a-z0-9-]{1,60}$/.test(trimmedSlug)) {
        safeLessonSlug = trimmedSlug;
      }
    }

    // 4. Validate and sanitize active movement step context
    let safeStep: StepContext | undefined;
    if (body.currentStep && typeof body.currentStep.name === "string") {
      safeStep = {
        index: typeof body.currentStep.index === "number" ? body.currentStep.index : 0,
        name: body.currentStep.name.replace(/\0/g, "").slice(0, 100),
        gloss: typeof body.currentStep.gloss === "string" ? body.currentStep.gloss.replace(/\0/g, "").slice(0, 400) : undefined,
        cues: Array.isArray(body.currentStep.cues)
          ? body.currentStep.cues.filter((c): c is string => typeof c === "string").map((c) => c.replace(/\0/g, "").slice(0, 200)).slice(0, 6)
          : undefined,
      };
    }

    // 5. Sanitize session conversation history
    const safeHistory: { role: "user" | "guru"; text: string }[] = [];
    if (Array.isArray(body.history)) {
      for (const item of body.history.slice(-6)) {
        if (
          item &&
          (item.role === "user" || item.role === "guru") &&
          typeof item.text === "string"
        ) {
          safeHistory.push({
            role: item.role,
            text: item.text.replace(/\0/g, "").slice(0, 1000),
          });
        }
      }
    }

    // 6. Validate language choice
    let safeLang = "en";
    if (typeof body.lang === "string") {
      const code = body.lang.trim().toLowerCase();
      if (/^[a-z]{2,5}(-[a-z0-9]{2,5})?$/.test(code)) {
        safeLang = code;
      }
    }

    // 7. Retrieve approved curriculum knowledge
    const context = retrieveGroundedKnowledge(
      sanitizedQuery,
      safeLessonSlug,
      safeHistory,
      safeStep
    );

    // 8. Synthesize grounded answer with multilingual support & terminology preservation
    const response = await synthesizeGuruAnswer(
      context,
      safeHistory,
      undefined,
      body.provider,
      safeLang
    );

    return NextResponse.json(response);
  } catch (err: unknown) {
    // Mask internal error details from the browser
    console.error("[API/guru/chat] Unexpected error occurred:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "The Virtual Guru encountered a temporary error. Please try asking your question again." },
      { status: 500 }
    );
  }
}
