import { describe, it } from "node:test";
import assert from "node:assert";
import {
  BHARATANATYAM_CURRICULUM,
  getLessonBySlug,
} from "../src/lib/curriculum/curriculumData.ts";
import {
  getChaptersForLesson,
  getChapterVoiceScript,
  type LessonChapter,
} from "../src/lib/curriculum/lessonChapters.ts";
import { CurriculumProgressService } from "../src/lib/services/CurriculumProgressService.ts";
import { getLessonSpecificSuggestions } from "../src/lib/guru/lessonSuggestions.ts";

describe("Voice-Led 3D Virtual Classroom Architecture", () => {
  it("Every curriculum lesson generates an authentic 8-chapter sequence", () => {
    assert.strictEqual(BHARATANATYAM_CURRICULUM.length, 13, "Curriculum has 13 published lessons");

    const expectedChapterIds = [
      "intro",
      "foundation",
      "demo",
      "details",
      "mistakes",
      "recap",
      "check",
      "transition",
    ];

    for (const lesson of BHARATANATYAM_CURRICULUM) {
      const chapters = getChaptersForLesson(lesson, "en");
      assert.strictEqual(
        chapters.length,
        8,
        `Lesson ${lesson.slug} must have exactly 8 chapters, found ${chapters.length}`
      );

      chapters.forEach((ch, idx) => {
        assert.strictEqual(ch.index, idx, `Chapter index mismatch in ${lesson.slug} at ${ch.id}`);
        assert.ok(ch.title.length > 0, `Chapter ${ch.id} in ${lesson.slug} must have a title`);
        assert.ok(ch.shortTitle.length > 0, `Chapter ${ch.id} in ${lesson.slug} must have shortTitle`);
        assert.ok(ch.voiceScript.length > 20, `Chapter ${ch.id} in ${lesson.slug} must have narration voiceScript`);
        assert.ok(ch.summary.length > 10, `Chapter ${ch.id} in ${lesson.slug} must have concise summary`);
      });

      // Chapter sequence structure checks
      assert.strictEqual(chapters[0].id, "intro", `Chapter 0 must be intro in ${lesson.slug}`);
      assert.strictEqual(chapters[5].id, "recap", `Chapter 5 must be recap in ${lesson.slug}`);
      assert.strictEqual(chapters[6].id, "check", `Chapter 6 must be check in ${lesson.slug}`);
      assert.strictEqual(chapters[7].id, "transition", `Chapter 7 must be transition in ${lesson.slug}`);

      // Chapter 7 Formative Understanding Check
      const quiz = chapters[6].understandingCheck;
      assert.ok(quiz, `Lesson ${lesson.slug} Chapter 7 must provide an understandingCheck`);
      assert.ok(quiz.question.length > 10, `Quiz question missing in ${lesson.slug}`);
      assert.ok(quiz.options.length >= 2, `Quiz must have at least 2 options in ${lesson.slug}`);
      assert.ok(
        quiz.correctIndex >= 0 && quiz.correctIndex < quiz.options.length,
        `Quiz correctIndex invalid in ${lesson.slug}`
      );
      assert.ok(quiz.explanation.length > 15, `Quiz explanation missing in ${lesson.slug}`);
    }
  });

  it("Lesson-specific visual demonstration modes are tailored to pedagogy", () => {
    // 1. Introduction: Concept Triad (Nritta/Nritya/Natya), NOT Aramandi
    const intro = getLessonBySlug("intro-bharatanatyam")!;
    const introChapters = getChaptersForLesson(intro);
    assert.strictEqual(introChapters[2].visualMode, "concept-triad");
    assert.match(introChapters[2].summary, /triad diagram|geometry, emotion, and drama/i);

    // 2. Samapada and Aramandi: Posture 3D with alignment checkpoints & knee safety
    const aramandi = getLessonBySlug("samapada-and-aramandi")!;
    const aramandiChapters = getChaptersForLesson(aramandi);
    assert.strictEqual(aramandiChapters[2].visualMode, "posture-3d");
    assert.ok(aramandiChapters[3].techniqueCues && aramandiChapters[3].techniqueCues.length > 0);
    assert.ok(aramandiChapters[4].commonMistakes && aramandiChapters[4].commonMistakes.length > 0);

    // 3. Pataka Hasta: Mudra 3D with verified viniyogas
    const pataka = getLessonBySlug("asamyukta-hastas")!;
    const patakaChapters = getChaptersForLesson(pataka);
    assert.strictEqual(patakaChapters[2].visualMode, "mudra-3d");
    assert.match(patakaChapters[1].voiceScript, /Pataka/);
    assert.match(patakaChapters[2].voiceScript, /hand demonstration|fingers|palm/i);

    // 4. Namaskaram: 60 FPS .nvclip authentic mocap take
    const namaskaram = getLessonBySlug("namaskaram")!;
    const namaskaramChapters = getChaptersForLesson(namaskaram);
    assert.strictEqual(namaskaramChapters[2].visualMode, "mocap-3d");
    assert.match(namaskaramChapters[2].voiceScript, /Namaskaram|eleven sequential steps|touch of the earth/i);

    // 5. Thattadavu: 60 FPS .nvclip authentic mocap take
    const thattadavu = getLessonBySlug("thattadavu")!;
    const thattadavuChapters = getChaptersForLesson(thattadavu);
    assert.strictEqual(thattadavuChapters[2].visualMode, "mocap-3d");
    assert.match(thattadavuChapters[2].voiceScript, /Thattadavu|heels lift cleanly|stamp/i);

    // 6. Natta Adavu: Honest studio mocap in-production state
    const natta = getLessonBySlug("natta-adavu")!;
    const nattaChapters = getChaptersForLesson(natta);
    assert.strictEqual(nattaChapters[2].visualMode, "mocap-in-production");
    assert.match(nattaChapters[2].summary, /Studio Notice|Motion capture is scheduled/i);
    assert.match(nattaChapters[3].summary, /Kutti Thattu/);

    // 7. Adi Tala: Rhythm meter visualizer
    const tala = getLessonBySlug("adi-tala-and-rhythm")!;
    const talaChapters = getChaptersForLesson(tala);
    assert.strictEqual(talaChapters[2].visualMode, "rhythm-meter");
    assert.match(talaChapters[2].voiceScript, /8-beat/i);
  });

  it("Localized voice narration scripts resolve correctly across languages", () => {
    const aramandi = getLessonBySlug("samapada-and-aramandi")!;
    const chIntro = getChaptersForLesson(aramandi, "en")[0];

    const enScript = getChapterVoiceScript(chIntro, "en");
    const hiScript = getChapterVoiceScript(chIntro, "hi");
    const taScript = getChapterVoiceScript(chIntro, "ta");
    const teScript = getChapterVoiceScript(chIntro, "te");

    assert.ok(enScript.length > 0, "English voice script present");
    assert.ok(hiScript.length > 0, "Hindi voice script present");
    assert.ok(taScript.length > 0, "Tamil voice script present");
    assert.ok(teScript.length > 0, "Telugu voice script present");

    // Classical terminology preservation in vernacular scripts
    assert.match(hiScript, /Aramandi|Samapada/);
    assert.match(taScript, /Aramandi|Samapada/);
    assert.match(teScript, /Aramandi|Samapada/);
  });

  it("Dynamic lesson-specific suggestions generate contextual prompts", () => {
    // 1. Introduction suggestions (must not suggest Aramandi)
    const introSugEn = getLessonSpecificSuggestions("intro-bharatanatyam", 0, undefined, "en");
    assert.ok(introSugEn.some((s) => s.includes("Nritta and Nritya")));
    assert.ok(!introSugEn.some((s) => s.includes("Kutti Thattu")));

    // 2. Aramandi suggestions
    const aramandiSugEn = getLessonSpecificSuggestions("samapada-and-aramandi", 2, undefined, "en");
    assert.ok(aramandiSugEn.some((s) => s.includes("knees in Aramandi")));
    assert.ok(aramandiSugEn.some((s) => s.includes("turnout")));

    // 3. Pataka suggestions
    const patakaSugEn = getLessonSpecificSuggestions("asamyukta-hastas", 2, undefined, "en");
    assert.ok(patakaSugEn.some((s) => s.includes("Pataka Hasta")));

    // 4. Natta Adavu suggestions
    const nattaSugEn = getLessonSpecificSuggestions("natta-adavu", 2, undefined, "en");
    assert.ok(nattaSugEn.some((s) => s.includes("Kutti Thattu")));
    assert.ok(nattaSugEn.some((s) => s.includes("Tatta Adavu")));

    // 5. Vernacular suggestions (Hindi / Tamil / Telugu)
    const aramandiSugHi = getLessonSpecificSuggestions("samapada-and-aramandi", 0, undefined, "hi");
    assert.ok(aramandiSugHi.some((s) => s.includes("घुटनों का सुरक्षित संरेखण")));

    const introSugTa = getLessonSpecificSuggestions("intro-bharatanatyam", 0, undefined, "ta");
    assert.ok(introSugTa.some((s) => s.includes("Nritta மற்றும் Nritya")));
  });

  it("CurriculumProgressService chapter progression behaves correctly", () => {
    // Progress service operates with safe fallbacks in non-browser Node environments
    const prog = CurriculumProgressService.getChapterProgress("samapada-and-aramandi");
    assert.strictEqual(typeof prog.currentChapter, "number");
    assert.strictEqual(typeof prog.maxChapterReached, "number");
    assert.strictEqual(typeof prog.quizAnswered, "boolean");
  });
});
