import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { retrieveGroundedKnowledge } from "../src/lib/guru/knowledgeRetriever.ts";
import {
  synthesizeDeterministicGroundedAnswer,
  cleanSpokenText,
} from "../src/lib/guru/guruSynthesizer.ts";

describe("Phase 6: Interactive Virtual Guru Assistant", () => {
  it("1. Answers a basic Bharatanatyam question (What is Aramandi?)", () => {
    const context = retrieveGroundedKnowledge("What is Aramandi?");
    assert.strictEqual(context.isOutOfScope, false);
    assert.ok(context.matchedLessons.some((l) => l.slug === "samapada-and-aramandi"));

    const { answer } = synthesizeDeterministicGroundedAnswer(context);
    assert.match(answer, /Aramandi/i);
    assert.match(answer, /diamond/i);
    assert.match(answer, /hip/i);
  });

  it("2. Answers a question about an existing mudra (Explain Pataka Hasta)", () => {
    const context = retrieveGroundedKnowledge("Explain Pataka Hasta");
    assert.strictEqual(context.isOutOfScope, false);
    assert.ok(context.matchedMudras.some((m) => m.slug === "pataka"));

    const { answer } = synthesizeDeterministicGroundedAnswer(context);
    assert.match(answer, /Pataka/i);
    assert.match(answer, /Flag/i);
    assert.match(answer, /Viniyoga/i);
  });

  it("3. Distinguishes Tatta Adavu from Natta Adavu with honest status", () => {
    const context = retrieveGroundedKnowledge(
      "How is Tatta Adavu different from Natta Adavu?"
    );
    assert.strictEqual(context.isOutOfScope, false);

    const { answer } = synthesizeDeterministicGroundedAnswer(context);
    assert.match(answer, /Tatta Adavu/i);
    assert.match(answer, /Natta Adavu/i);
    assert.match(answer, /heel/i);
    assert.match(answer, /production/i);
  });

  it("4. Answers question about current lesson context (Namaskaram)", () => {
    const context = retrieveGroundedKnowledge(
      "Why do we perform Namaskaram?",
      "namaskaram"
    );
    assert.strictEqual(context.isOutOfScope, false);

    const { answer } = synthesizeDeterministicGroundedAnswer(context);
    assert.match(answer, /Bhumi Devi|Mother Earth/i);
    assert.match(answer, /forgiveness/i);
  });

  it("5. Handles follow-up simplification requests (explain simply)", () => {
    const context = retrieveGroundedKnowledge(
      "Can you explain this simply?",
      "samapada-and-aramandi",
      [{ role: "user", text: "What is Aramandi?" }]
    );
    assert.strictEqual(context.isOutOfScope, false);

    const { answer } = synthesizeDeterministicGroundedAnswer(context);
    assert.match(answer, /simple/i);
    assert.match(answer, /Core Posture|Key Cue/i);
  });

  it("6. Handles 'what next' curriculum progression query", () => {
    const context = retrieveGroundedKnowledge(
      "What should I learn after this lesson?",
      "samapada-and-aramandi"
    );
    assert.strictEqual(context.isOutOfScope, false);

    const { answer } = synthesizeDeterministicGroundedAnswer(context);
    assert.match(answer, /Basic Hand Positions|recommend/i);
    assert.ok(context.relatedLinks.length > 0);
  });

  it("7. Honestly refuses unsupported questions outside classical dance", () => {
    const context = retrieveGroundedKnowledge("What is the capital of Australia?");
    assert.strictEqual(context.isOutOfScope, true);

    const { answer } = synthesizeDeterministicGroundedAnswer(context);
    assert.match(answer, /outside our current beginner curriculum/i);
  });

  it("8. Identifies topics requiring guru validation and provides safety advisory", () => {
    const context = retrieveGroundedKnowledge("How deep should I bend in Aramandi?");
    assert.strictEqual(context.validationStatus, "guru-review-required");
    assert.ok(context.safetyAdvisory);
    assert.match(context.safetyAdvisory, /hip rotation/);
  });

  it("9. Cleans spoken text by removing markdown and links", () => {
    const raw = "Here is **[Pataka](/library/pataka)**: *keep fingers straight*!";
    const cleaned = cleanSpokenText(raw);
    assert.strictEqual(cleaned, "Here is Pataka: keep fingers straight!");
  });
});
