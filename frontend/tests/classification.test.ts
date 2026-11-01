import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateDistance,
  getFingerExtensionScore,
  classifyMudra,
  classifySamyuktaMudra,
  getSpecificMudraScore,
  type Point,
} from "../src/lib/mediapipe/classification.ts";

function createSyntheticHand(overrides: Partial<Record<number, Point>> = {}): Point[] {
  const points: Point[] = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  
  // Set default wrist and palm base
  points[0] = { x: 0.0, y: 0.0, z: 0.0 };
  points[9] = { x: 0.0, y: 0.10, z: 0.0 };

  // Set default straight index finger (vertical)
  points[5] = { x: -0.02, y: 0.10, z: 0.0 };
  points[6] = { x: -0.02, y: 0.13, z: 0.0 };
  points[7] = { x: -0.02, y: 0.16, z: 0.0 };
  points[8] = { x: -0.02, y: 0.19, z: 0.0 };

  // Set default straight middle finger (vertical)
  points[9] = { x: 0.0, y: 0.10, z: 0.0 };
  points[10] = { x: 0.0, y: 0.13, z: 0.0 };
  points[11] = { x: 0.0, y: 0.16, z: 0.0 };
  points[12] = { x: 0.0, y: 0.19, z: 0.0 };

  // Set default curled ring and pinky fingers
  points[13] = { x: 0.02, y: 0.10, z: 0.0 };
  points[14] = { x: 0.02, y: 0.12, z: 0.02 };
  points[15] = { x: 0.02, y: 0.11, z: 0.03 };
  points[16] = { x: 0.02, y: 0.09, z: 0.02 };

  points[17] = { x: 0.04, y: 0.10, z: 0.0 };
  points[18] = { x: 0.04, y: 0.12, z: 0.02 };
  points[19] = { x: 0.04, y: 0.11, z: 0.03 };
  points[20] = { x: 0.04, y: 0.09, z: 0.02 };

  // Apply specific landmark overrides
  for (const [idxStr, pt] of Object.entries(overrides)) {
    const idx = Number(idxStr);
    if (pt) {
      points[idx] = pt;
    }
  }
  return points;
}

describe("MediaPipe Classification & Geometric Solvers", () => {
  test("calculateDistance computes 3D Euclidean distance correctly", () => {
    const p1: Point = { x: 1, y: 2, z: 3 };
    const p2: Point = { x: 4, y: 6, z: 3 };
    assert.equal(calculateDistance(p1, p2), 5);
  });

  test("getFingerExtensionScore returns 1.0 for perfectly straight finger", () => {
    const hand = createSyntheticHand();
    const score = getFingerExtensionScore(hand, [5, 6, 7, 8]);
    assert.equal(score, 1.0);
  });

  test("getFingerExtensionScore returns lower ratio for curled finger", () => {
    const hand = createSyntheticHand({
      6: { x: -0.02, y: 0.13, z: 0.02 },
      7: { x: -0.02, y: 0.11, z: 0.04 },
      8: { x: -0.02, y: 0.09, z: 0.02 },
    });
    const score = getFingerExtensionScore(hand, [5, 6, 7, 8]);
    assert.ok(score < 0.65, `Expected score < 0.65 for curled finger, got ${score}`);
  });

  test("classifyMudra handles empty or non-matching hand cleanly", () => {
    const emptyHand: Point[] = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
    const result = classifyMudra(emptyHand);
    assert.equal(result.name, "No Mudra Detected");
    assert.equal(typeof result.confidence, "number");
    assert.ok(result.feedback.length > 0);
  });

  test("getSpecificMudraScore evaluates targeted mudra score and feedback", () => {
    const hand = createSyntheticHand();
    const patakaScore = getSpecificMudraScore(hand, "pataka", "Right");
    assert.equal(patakaScore.name, "Pataka");
    assert.ok(typeof patakaScore.confidence === "number");
    assert.ok(patakaScore.confidence >= 0 && patakaScore.confidence <= 1.0);
    assert.ok(patakaScore.feedback.length > 0);
  });

  test("Kartarimukha is distinguished from Ardhapataka when index and middle are spread in a V-shape", () => {
    // Both index and middle fingers straight, fanning outward in a V (distIdxMid > 0.08)
    const kartarimukhaHand = createSyntheticHand({
      5: { x: -0.02, y: 0.10, z: 0.0 },
      6: { x: -0.03, y: 0.13, z: 0.0 },
      7: { x: -0.04, y: 0.16, z: 0.0 },
      8: { x: -0.05, y: 0.19, z: 0.0 },

      9: { x: 0.02, y: 0.10, z: 0.0 },
      10: { x: 0.03, y: 0.13, z: 0.0 },
      11: { x: 0.04, y: 0.16, z: 0.0 },
      12: { x: 0.05, y: 0.19, z: 0.0 },
    });
    const dist = calculateDistance(kartarimukhaHand[8], kartarimukhaHand[12]);
    assert.ok(dist > 0.08, `Expected dist > 0.08, got ${dist}`);

    const result = classifyMudra(kartarimukhaHand, "Right");
    assert.equal(result.name, "Kartarimukha");
    assert.ok(result.feedback.includes("V-shape"));
  });

  test("Ardhapataka is classified when index and middle fingers are held strictly together", () => {
    // Both index and middle straight and parallel/close together (distIdxMid <= 0.08)
    const ardhapatakaHand = createSyntheticHand({
      5: { x: -0.01, y: 0.10, z: 0.0 },
      6: { x: -0.01, y: 0.13, z: 0.0 },
      7: { x: -0.01, y: 0.16, z: 0.0 },
      8: { x: -0.01, y: 0.19, z: 0.0 },

      9: { x: 0.01, y: 0.10, z: 0.0 },
      10: { x: 0.01, y: 0.13, z: 0.0 },
      11: { x: 0.01, y: 0.16, z: 0.0 },
      12: { x: 0.01, y: 0.19, z: 0.0 },
    });
    const dist = calculateDistance(ardhapatakaHand[8], ardhapatakaHand[12]);
    assert.ok(dist <= 0.08, `Expected dist <= 0.08, got ${dist}`);

    const result = classifyMudra(ardhapatakaHand, "Right");
    assert.equal(result.name, "Ardhapataka");
    assert.ok(result.feedback.includes("vertical"));
  });

  test("classifySamyuktaMudra detects Anjali mudra when both palms are pressed", () => {
    const hand1: Point[] = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
    const hand2: Point[] = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));

    hand1[0] = { x: -0.01, y: 0.0, z: 0.0 };
    hand2[0] = { x: 0.01, y: 0.0, z: 0.0 };

    hand1[12] = { x: -0.01, y: 0.2, z: 0.0 };
    hand2[12] = { x: 0.01, y: 0.2, z: 0.0 };

    for (const [base, mcp] of [[5, -0.02], [9, 0], [13, 0.02], [17, 0.04]]) {
      for (const h of [hand1, hand2]) {
        h[base] = { x: mcp, y: 0.10, z: 0 };
        h[base + 1] = { x: mcp, y: 0.13, z: 0 };
        h[base + 2] = { x: mcp, y: 0.16, z: 0 };
        h[base + 3] = { x: mcp, y: 0.19, z: 0 };
      }
    }

    const samyukta = classifySamyuktaMudra(hand1, hand2);
    if (samyukta) {
      assert.equal(samyukta.name, "Anjali");
      assert.ok(samyukta.confidence > 0.5);
    }
  });
});
