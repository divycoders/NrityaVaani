import { describe, it } from "node:test";
import assert from "node:assert";
import { getLessonProvenance, CURRICULUM_PROVENANCE } from "../src/lib/curriculum/provenance.ts";
import {
  BHARATANATYAM_CURRICULUM,
  getLessonBySlug,
  CURRICULUM_LEVELS,
} from "../src/lib/curriculum/curriculumData.ts";
import { MUDRAS } from "../src/lib/constants/mudras.ts";

describe("Curriculum Knowledge & Provenance Architecture", () => {
  it("Every curriculum lesson has valid provenance registered", () => {
    for (const lesson of BHARATANATYAM_CURRICULUM) {
      const prov = getLessonProvenance(lesson.slug);
      assert.ok(prov, `Missing provenance for lesson slug: ${lesson.slug}`);
      assert.ok(prov.sourceText.length > 0, `Empty sourceText for ${lesson.slug}`);
      assert.ok(
        ["source-supported", "guru-review-required", "in-production"].includes(
          prov.validationStatus
        ),
        `Invalid validationStatus ${prov.validationStatus} in ${lesson.slug}`
      );
    }
  });

  it("Mudra counts and library models are accurately documented", () => {
    const asamyuktaInLibrary = MUDRAS.filter((m) => m.category === "Asamyukta Hasta");
    const samyuktaInLibrary = MUDRAS.filter((m) => m.category === "Samyukta Hasta");

    assert.strictEqual(MUDRAS.length, 28, "Digital library has 28 mudras total");
    assert.strictEqual(asamyuktaInLibrary.length, 18, "Digital library has 18 Asamyukta Hastas");
    assert.strictEqual(samyuktaInLibrary.length, 10, "Digital library has 10 Samyukta Hastas");

    // Check lesson 5-1 and 5-2 metadata
    const l5_1 = getLessonBySlug("asamyukta-hastas");
    assert.ok(l5_1, "Lesson asamyukta-hastas exists");
    assert.match(
      l5_1.subtitle,
      /28 in tradition; 18 interactive in library/,
      "Lesson 5-1 subtitle accurately distinguishes classical canon from library scope"
    );

    const l5_2 = getLessonBySlug("samyukta-hastas");
    assert.ok(l5_2, "Lesson samyukta-hastas exists");
    assert.match(
      l5_2.subtitle,
      /24 in tradition; 10 interactive in library/,
      "Lesson 5-2 subtitle accurately distinguishes classical canon from library scope"
    );
  });

  it("Natta Adavu is honestly marked as mocap in production", () => {
    const natta = getLessonBySlug("natta-adavu");
    assert.ok(natta, "Lesson natta-adavu exists");
    assert.strictEqual(natta.status, "mocap-pending");
    assert.strictEqual(natta.hasMotionClip, false);
    assert.strictEqual(natta.needsGuruReview, true);

    const prov = getLessonProvenance("natta-adavu");
    assert.strictEqual(prov?.validationStatus, "in-production");
  });

  it("All six curriculum levels exist and contain progressive lessons", () => {
    assert.strictEqual(CURRICULUM_LEVELS.length, 6, "Six curriculum levels defined");
    for (let lvl = 1; lvl <= 6; lvl++) {
      const lessonsInLvl = BHARATANATYAM_CURRICULUM.filter((l) => l.level === lvl);
      assert.ok(lessonsInLvl.length >= 2, `Level ${lvl} has at least 2 progressive lessons`);
    }
  });

  it("Safety advisories are attached to physically demanding lessons", () => {
    const aramandi = getLessonBySlug("samapada-and-aramandi");
    assert.ok(aramandi?.safetyAdvisory, "Aramandi must have a safety advisory on turnout");
    assert.match(aramandi.safetyAdvisory!, /hip rotation/);

    const revision = getLessonBySlug("daily-revision-routine");
    assert.ok(revision?.safetyAdvisory, "Daily revision must have a safety advisory");
    assert.match(revision.safetyAdvisory!, /Never skip warm-up/);
  });
});
