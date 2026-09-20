import type { FingerStatus } from './types';

/** What a classifier call returns: the name it settled on, how firmly, and why. */
export interface MudraScore {
  name: string;
  /** 0-1. */
  confidence: number;
  feedback: string;
  fingerStatus?: Record<'thumb' | 'index' | 'middle' | 'ring' | 'pinky', FingerStatus>;
  corrections?: string[];
  detectedMudraName?: string;
  detectedConfidence?: number;
}

export interface Point {
  x: number;
  y: number;
  z: number;
}

export function calculateDistance(p1: Point, p2: Point): number {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + 
    Math.pow(p1.y - p2.y, 2) + 
    Math.pow(p1.z - p2.z, 2)
  );
}

/**
 * Calculates how much a finger is extended.
 * Returns a value from 0 (fully bent) to 1 (fully straight).
 */
export function getFingerExtensionScore(landmarks: Point[], fingerIndices: number[]): number {
  const [mcpIdx, pipIdx, dipIdx, tipIdx] = fingerIndices;
  const mcp = landmarks[mcpIdx];
  const pip = landmarks[pipIdx];
  const dip = landmarks[dipIdx];
  const tip = landmarks[tipIdx];

  if (!mcp || !pip || !dip || !tip) return 0;

  const distMcpTip = calculateDistance(mcp, tip);
  const distSegments = 
    calculateDistance(mcp, pip) + 
    calculateDistance(pip, dip) + 
    calculateDistance(dip, tip);

  return distSegments > 0 ? Math.min(1.0, distMcpTip / distSegments) : 0;
}

const SAMYUKTA_MUDRA_SET = new Set([
  'anjali', 'kapota', 'karkata', 'swastika', 'swastika-double',
  'shivalinga', 'pushpaputa', 'shankha', 'chakra', 'chakra-double',
  'matsya', 'garuda', 'samputa', 'pasha', 'kilaka', 'bherunda', 'kurma', 'varaha'
]);

export function isSamyuktaMudra(nameOrSlug: string): boolean {
  if (!nameOrSlug) return false;
  const cleaned = nameOrSlug.toLowerCase().trim().replace(/\s+/g, '-');
  const simple = cleaned.replace(/[^a-z]/g, '');
  return SAMYUKTA_MUDRA_SET.has(cleaned) || SAMYUKTA_MUDRA_SET.has(simple);
}

// -----------------------------------------------------------------------------
// Free Classifier (identifies best matching mudra without target)
// -----------------------------------------------------------------------------
export function classifyMudra(landmarks: Point[], _handedness?: string): MudraScore {
  const thumbIdx = [1, 2, 3, 4];
  const indexIdx = [5, 6, 7, 8];
  const middleIdx = [9, 10, 11, 12];
  const ringIdx = [13, 14, 15, 16];
  const pinkyIdx = [17, 18, 19, 20];

  const sThumb = getFingerExtensionScore(landmarks, thumbIdx);
  const sIdx = getFingerExtensionScore(landmarks, indexIdx);
  const sMid = getFingerExtensionScore(landmarks, middleIdx);
  const sRng = getFingerExtensionScore(landmarks, ringIdx);
  const sPky = getFingerExtensionScore(landmarks, pinkyIdx);

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const distThumbRing = calculateDistance(thumbTip, ringTip);
  const distIdxMid = calculateDistance(indexTip, middleTip);
  const distMidRng = calculateDistance(middleTip, ringTip);
  const distThumbIndex = calculateDistance(thumbTip, indexTip);
  const distMidThumb = calculateDistance(middleTip, thumbTip);
  const distRngThumb = calculateDistance(ringTip, thumbTip);
  const distPkyThumb = calculateDistance(pinkyTip, thumbTip);

  const isExt = (s: number) => s > 0.82;
  const isCurved = (s: number) => s > 0.45 && s <= 0.82;
  const isBent = (s: number) => s <= 0.60;

  let bestMudra: MudraScore | null = null;
  let maxConfidence = 0;

  const consider = (name: string, confidence: number, feedback: string) => {
    const roundedConf = Math.min(1.0, Math.round(confidence * 100) / 100);
    if (roundedConf > maxConfidence) {
      maxConfidence = roundedConf;
      bestMudra = { name, confidence: roundedConf, feedback };
    }
  };

  // 1. Pataka: All 4 straight & together, thumb tucked
  if (isExt(sIdx) && isExt(sMid) && isExt(sRng) && isExt(sPky)) {
    if (distThumbIndex < 0.13) {
      const togetherness = 1 - (distIdxMid + distMidRng) * 1.8;
      const conf = ((sIdx + sMid + sRng + sPky) / 4) * Math.max(0.1, togetherness);
      consider("Pataka", conf, "Excellent. Keep the fingers strictly together.");
    }
  }

  // 2. Tripataka: Pataka + Ring bent
  if (isExt(sIdx) && isExt(sMid) && isBent(sRng) && isExt(sPky)) {
    const conf = (sIdx + sMid + (1 - sRng) + sPky) / 4;
    consider("Tripataka", conf, "Good. Ring finger must be distinctly bent.");
  }

  // 3. Ardhapataka: Index, Middle straight; Ring, Pinky bent
  if (isExt(sIdx) && isExt(sMid) && isBent(sRng) && isBent(sPky) && distIdxMid < 0.06) {
    const conf = (sIdx + sMid + (1 - sRng) + (1 - sPky)) / 4;
    consider("Ardhapataka", conf, "Nice. Keep index and middle fingers straight.");
  }

  // 4. Kartarimukha: Index, Middle spread in V; Ring, Pinky bent
  if (isExt(sIdx) && isExt(sMid) && isBent(sRng) && isBent(sPky) && distIdxMid >= 0.06) {
    const conf = ((sIdx + sMid + (1 - sRng) + (1 - sPky)) / 4) * Math.min(1.2, distIdxMid * 10);
    consider("Kartarimukha", conf, "Great scissors V-shape. Keep index and middle wide.");
  }

  // 5. Mayura: Ring tip touches thumb tip; Index, Middle, Pinky straight
  if (distThumbRing < 0.065 && isExt(sIdx) && isExt(sMid) && isExt(sPky)) {
    const conf = (1 - distThumbRing * 12) * ((sIdx + sMid + sPky) / 3);
    consider("Mayura", conf, "Graceful peacock gesture. Thumb and ring tips touch.");
  }

  // 6. Arala: Index bent hook; Middle, Ring, Pinky straight
  if (isBent(sIdx) && isExt(sMid) && isExt(sRng) && isExt(sPky)) {
    const conf = ((1 - sIdx) + sMid + sRng + sPky) / 4;
    consider("Arala", conf, "Bent index with other fingers upright.");
  }

  // 7. Shukatunda: Index and Ring bent; Middle and Pinky straight
  if (isBent(sIdx) && isExt(sMid) && isBent(sRng) && isExt(sPky)) {
    const conf = ((1 - sIdx) + sMid + (1 - sRng) + sPky) / 4;
    consider("Shukatunda", conf, "Parrot beak form detected.");
  }

  // 8. Mushti: Closed fist, thumb wrapped
  if (isBent(sIdx) && isBent(sMid) && isBent(sRng) && isBent(sPky) && sThumb <= 0.75) {
    const conf = ((1 - sIdx) + (1 - sMid) + (1 - sRng) + (1 - sPky) + (1 - sThumb)) / 5;
    consider("Mushti", conf, "Firm closed fist with thumb wrapped across fingers.");
  }

  // 9. Shikhara: Fist with thumb raised vertical
  if (isBent(sIdx) && isBent(sMid) && isBent(sRng) && isBent(sPky) && isExt(sThumb)) {
    const conf = ((1 - sIdx) + (1 - sMid) + (1 - sRng) + (1 - sPky) + sThumb) / 5;
    consider("Shikhara", conf, "Mountain peak gesture. Thumb held upright.");
  }

  // 10. Suchi: Index straight; others curled
  if (isExt(sIdx) && isBent(sMid) && isBent(sRng) && isBent(sPky) && distThumbIndex < 0.12) {
    const conf = (sIdx + (1 - sMid) + (1 - sRng) + (1 - sPky) + (1 - sThumb)) / 5;
    consider("Suchi", conf, "Needle gesture. Index pointed straight up.");
  }

  // 11. Chandrakala: Index straight, thumb extended outward in L-shape
  if (isExt(sIdx) && isExt(sThumb) && distThumbIndex >= 0.12 && isBent(sMid) && isBent(sRng) && isBent(sPky)) {
    const conf = (sIdx + sThumb + (1 - sMid) + (1 - sRng) + (1 - sPky)) / 5;
    consider("Chandrakala", conf, "Crescent moon shape formed by index and thumb.");
  }

  // 12. Padmakosha: All fingers curved inward like a cup
  if (isCurved(sIdx) && isCurved(sMid) && isCurved(sRng) && isCurved(sPky)) {
    const curveScore = (s: number) => Math.max(0, 1 - Math.abs(s - 0.62) * 2.5);
    const conf = (curveScore(sIdx) + curveScore(sMid) + curveScore(sRng) + curveScore(sPky)) / 4;
    consider("Padmakosha", conf, "Lotus bud gesture. Fingers curved inward.");
  }

  // 13. Sarpashirsha: Flat hand cupped forward
  if (sIdx > 0.70 && sMid > 0.70 && sRng > 0.70 && sPky > 0.70 && distIdxMid < 0.05) {
    const conf = (sIdx + sMid + sRng + sPky) / 4;
    consider("Sarpashirsha", conf, "Snake hood gesture.");
  }

  // 14. Mrigashirsha: Index and pinky up, middle and ring touch thumb
  if (isExt(sIdx) && isExt(sPky) && distMidThumb < 0.07 && distRngThumb < 0.07) {
    const conf = (sIdx + sPky + (1 - distMidThumb * 10) + (1 - distRngThumb * 10)) / 4;
    consider("Mrigashirsha", conf, "Deer head gesture with horns upright.");
  }

  // 15. Simhamukha: Index and pinky up, middle and ring touch thumb tip
  if (isExt(sIdx) && isExt(sPky) && distMidThumb < 0.06 && distRngThumb < 0.06) {
    const conf = (sIdx + sPky + (1 - distMidThumb * 12) + (1 - distRngThumb * 12)) / 4;
    consider("Simhamukha", conf, "Lion face gesture.");
  }

  // 16. Alapadma: Fingers separated and curved outwards
  if (isCurved(sPky) && isCurved(sRng) && isCurved(sMid) && distIdxMid > 0.04 && distMidRng > 0.04) {
    const conf = ((1 - Math.abs(sPky - 0.65)) + (1 - Math.abs(sRng - 0.65)) + (1 - Math.abs(sMid - 0.65))) / 3;
    consider("Alapadma", conf, "Full blooming lotus gesture.");
  }

  // 17. Mukula: All 5 tips touching together
  if (distThumbIndex < 0.06 && distMidThumb < 0.06 && distRngThumb < 0.06 && distPkyThumb < 0.06) {
    const avgDist = (distThumbIndex + distMidThumb + distRngThumb + distPkyThumb) / 4;
    const conf = Math.max(0, 1 - avgDist * 14);
    consider("Mukula", conf, "Flower bud. All fingertips brought together.");
  }

  // 18. Trishula: Thumb touches pinky, index, middle, ring straight
  if (distPkyThumb < 0.07 && isExt(sIdx) && isExt(sMid) && isExt(sRng)) {
    const conf = (sIdx + sMid + sRng + (1 - distPkyThumb * 10)) / 4;
    consider("Trishula", conf, "Trident gesture. Three fingers held upright.");
  }

  // 19. Ardhachandra: Pataka with thumb stretched wide
  if (isExt(sIdx) && isExt(sMid) && isExt(sRng) && isExt(sPky) && distThumbIndex > 0.14) {
    const conf = (sIdx + sMid + sRng + sPky + Math.min(1, distThumbIndex * 6)) / 5;
    consider("Ardhachandra", conf, "Half moon. Thumb stretched out from flat palm.");
  }

  // 20. Hamsasya: Index tip touches thumb tip, others straight
  if (distThumbIndex < 0.06 && isExt(sMid) && isExt(sRng) && isExt(sPky)) {
    const conf = (1 - distThumbIndex * 12) * ((sMid + sRng + sPky) / 3);
    consider("Hamsasya", conf, "Swan beak gesture. Thumb and index tips meet.");
  }

  if (maxConfidence > 0.5 && bestMudra) {
    return bestMudra;
  }

  return { 
    name: "No Mudra Detected", 
    confidence: Math.round((maxConfidence || 0) * 100) / 100, 
    feedback: "Adjust your hand position in front of the camera." 
  };
}

// -----------------------------------------------------------------------------
// Detailed Practice Mode Evaluator (Kinematic data, per-finger status, corrections)
// -----------------------------------------------------------------------------
export function getSpecificMudraScore(landmarks: Point[], targetMudra: string, handedness?: string): MudraScore {
  const actualBest = classifyMudra(landmarks, handedness);

  const thumbIdx = [1, 2, 3, 4];
  const indexIdx = [5, 6, 7, 8];
  const middleIdx = [9, 10, 11, 12];
  const ringIdx = [13, 14, 15, 16];
  const pinkyIdx = [17, 18, 19, 20];

  const sThumb = getFingerExtensionScore(landmarks, thumbIdx);
  const sIdx = getFingerExtensionScore(landmarks, indexIdx);
  const sMid = getFingerExtensionScore(landmarks, middleIdx);
  const sRng = getFingerExtensionScore(landmarks, ringIdx);
  const sPky = getFingerExtensionScore(landmarks, pinkyIdx);

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const distThumbRing = calculateDistance(thumbTip, ringTip);
  const distRngThumb = distThumbRing;
  const distIdxMid = calculateDistance(indexTip, middleTip);
  const distMidRng = calculateDistance(middleTip, ringTip);
  const distRngPky = calculateDistance(ringTip, pinkyTip);
  const distThumbIndex = calculateDistance(thumbTip, indexTip);
  const distMidThumb = calculateDistance(middleTip, thumbTip);
  const distPkyThumb = calculateDistance(pinkyTip, thumbTip);

  const isStraight = (s: number) => s >= 0.78;
  const isBent = (s: number) => s <= 0.60;
  const isCurved = (s: number) => s > 0.48 && s < 0.78;

  const fingerStatus: Record<'thumb' | 'index' | 'middle' | 'ring' | 'pinky', FingerStatus> = {
    thumb: { label: 'Thumb', isCorrect: false, state: isStraight(sThumb) ? 'straight' : 'bent', targetState: 'straight', score: sThumb },
    index: { label: 'Index', isCorrect: false, state: isStraight(sIdx) ? 'straight' : isBent(sIdx) ? 'bent' : 'curved', targetState: 'straight', score: sIdx },
    middle: { label: 'Middle', isCorrect: false, state: isStraight(sMid) ? 'straight' : isBent(sMid) ? 'bent' : 'curved', targetState: 'straight', score: sMid },
    ring: { label: 'Ring', isCorrect: false, state: isStraight(sRng) ? 'straight' : isBent(sRng) ? 'bent' : 'curved', targetState: 'straight', score: sRng },
    pinky: { label: 'Pinky', isCorrect: false, state: isStraight(sPky) ? 'straight' : isBent(sPky) ? 'bent' : 'curved', targetState: 'straight', score: sPky },
  };

  const corrections: string[] = [];
  let confidence = 0;
  const normalizedTarget = (targetMudra || '').toLowerCase().trim().replace(/[^a-z]/g, '');

  switch (normalizedTarget) {
    case 'pataka': {
      fingerStatus.thumb.targetState = 'folded';
      fingerStatus.thumb.isCorrect = distThumbIndex < 0.13;
      fingerStatus.index.targetState = 'straight';
      fingerStatus.index.isCorrect = isStraight(sIdx);
      fingerStatus.middle.targetState = 'straight';
      fingerStatus.middle.isCorrect = isStraight(sMid);
      fingerStatus.ring.targetState = 'straight';
      fingerStatus.ring.isCorrect = isStraight(sRng);
      fingerStatus.pinky.targetState = 'straight';
      fingerStatus.pinky.isCorrect = isStraight(sPky);

      if (!fingerStatus.index.isCorrect) corrections.push('Straighten your index finger.');
      if (!fingerStatus.middle.isCorrect) corrections.push('Straighten your middle finger.');
      if (!fingerStatus.ring.isCorrect) corrections.push('Straighten your ring finger.');
      if (!fingerStatus.pinky.isCorrect) corrections.push('Straighten your pinky finger.');
      if (distIdxMid > 0.05 || distMidRng > 0.05) corrections.push('Keep all four fingers pressed flush together.');
      if (!fingerStatus.thumb.isCorrect) corrections.push('Tuck your thumb close to your index finger base.');

      const togetherness = Math.max(0, 1 - (distIdxMid + distMidRng + distRngPky) * 1.6);
      const extAvg = (sIdx + sMid + sRng + sPky) / 4;
      confidence = extAvg * 0.7 + togetherness * 0.3;
      break;
    }

    case 'tripataka': {
      fingerStatus.index.targetState = 'straight';
      fingerStatus.index.isCorrect = isStraight(sIdx);
      fingerStatus.middle.targetState = 'straight';
      fingerStatus.middle.isCorrect = isStraight(sMid);
      fingerStatus.ring.targetState = 'bent';
      fingerStatus.ring.isCorrect = isBent(sRng);
      fingerStatus.pinky.targetState = 'straight';
      fingerStatus.pinky.isCorrect = isStraight(sPky);
      fingerStatus.thumb.targetState = 'folded';
      fingerStatus.thumb.isCorrect = distThumbIndex < 0.14;

      if (!fingerStatus.ring.isCorrect) corrections.push('Bend your ring finger forward at the middle joint.');
      if (!fingerStatus.index.isCorrect) corrections.push('Keep your index finger straight.');
      if (!fingerStatus.middle.isCorrect) corrections.push('Keep your middle finger straight.');
      if (!fingerStatus.pinky.isCorrect) corrections.push('Keep your pinky finger extended.');

      confidence = (sIdx + sMid + (1 - sRng) + sPky) / 4;
      break;
    }

    case 'ardhapataka': {
      fingerStatus.index.targetState = 'straight';
      fingerStatus.index.isCorrect = isStraight(sIdx);
      fingerStatus.middle.targetState = 'straight';
      fingerStatus.middle.isCorrect = isStraight(sMid);
      fingerStatus.ring.targetState = 'bent';
      fingerStatus.ring.isCorrect = isBent(sRng);
      fingerStatus.pinky.targetState = 'bent';
      fingerStatus.pinky.isCorrect = isBent(sPky);

      if (!fingerStatus.index.isCorrect || !fingerStatus.middle.isCorrect) {
        corrections.push('Keep index and middle fingers straight and touching.');
      }
      if (!fingerStatus.ring.isCorrect || !fingerStatus.pinky.isCorrect) {
        corrections.push('Bend both ring and pinky fingers down into your palm.');
      }

      confidence = (sIdx + sMid + (1 - sRng) + (1 - sPky)) / 4;
      break;
    }

    case 'kartarimukha': {
      fingerStatus.index.targetState = 'straight';
      fingerStatus.index.isCorrect = isStraight(sIdx);
      fingerStatus.middle.targetState = 'straight';
      fingerStatus.middle.isCorrect = isStraight(sMid);
      fingerStatus.ring.targetState = 'bent';
      fingerStatus.ring.isCorrect = isBent(sRng);
      fingerStatus.pinky.targetState = 'bent';
      fingerStatus.pinky.isCorrect = isBent(sPky);

      const isWide = distIdxMid >= 0.07;
      if (!isWide) corrections.push('Spread index and middle fingers into a wide scissors V-shape.');
      if (!fingerStatus.ring.isCorrect || !fingerStatus.pinky.isCorrect) {
        corrections.push('Keep ring and pinky fingers bent into the palm.');
      }

      confidence = ((sIdx + sMid + (1 - sRng) + (1 - sPky)) / 4) * (isWide ? 1.0 : 0.6);
      break;
    }

    case 'mayura': {
      const isTouching = distThumbRing <= 0.065;
      fingerStatus.ring.targetState = 'touching';
      fingerStatus.ring.isCorrect = isTouching;
      fingerStatus.thumb.targetState = 'touching';
      fingerStatus.thumb.isCorrect = isTouching;
      fingerStatus.index.targetState = 'straight';
      fingerStatus.index.isCorrect = isStraight(sIdx);
      fingerStatus.middle.targetState = 'straight';
      fingerStatus.middle.isCorrect = isStraight(sMid);
      fingerStatus.pinky.targetState = 'straight';
      fingerStatus.pinky.isCorrect = isStraight(sPky);

      if (!isTouching) corrections.push('Touch the tip of your thumb to the tip of your ring finger.');
      if (!fingerStatus.index.isCorrect) corrections.push('Extend your index finger straight.');
      if (!fingerStatus.middle.isCorrect) corrections.push('Extend your middle finger straight.');
      if (!fingerStatus.pinky.isCorrect) corrections.push('Extend your pinky finger straight.');

      confidence = Math.max(0, (1 - distThumbRing * 12)) * ((sIdx + sMid + sPky) / 3);
      break;
    }

    case 'arala': {
      fingerStatus.index.targetState = 'bent';
      fingerStatus.index.isCorrect = sIdx <= 0.68;
      fingerStatus.middle.targetState = 'straight';
      fingerStatus.middle.isCorrect = isStraight(sMid);
      fingerStatus.ring.targetState = 'straight';
      fingerStatus.ring.isCorrect = isStraight(sRng);
      fingerStatus.pinky.targetState = 'straight';
      fingerStatus.pinky.isCorrect = isStraight(sPky);

      if (!fingerStatus.index.isCorrect) corrections.push('Bend your index finger inward like a curved hook.');
      if (!fingerStatus.middle.isCorrect || !fingerStatus.ring.isCorrect || !fingerStatus.pinky.isCorrect) {
        corrections.push('Keep middle, ring, and pinky fingers upright and aligned.');
      }

      confidence = ((1 - sIdx) + sMid + sRng + sPky) / 4;
      break;
    }

    case 'shukatunda': {
      fingerStatus.index.targetState = 'bent';
      fingerStatus.index.isCorrect = sIdx <= 0.68;
      fingerStatus.middle.targetState = 'straight';
      fingerStatus.middle.isCorrect = isStraight(sMid);
      fingerStatus.ring.targetState = 'bent';
      fingerStatus.ring.isCorrect = sRng <= 0.68;
      fingerStatus.pinky.targetState = 'straight';
      fingerStatus.pinky.isCorrect = isStraight(sPky);

      if (!fingerStatus.index.isCorrect || !fingerStatus.ring.isCorrect) {
        corrections.push('Bend both index and ring fingers inward into hooks.');
      }
      if (!fingerStatus.middle.isCorrect || !fingerStatus.pinky.isCorrect) {
        corrections.push('Keep middle and pinky fingers extended straight.');
      }

      confidence = ((1 - sIdx) + sMid + (1 - sRng) + sPky) / 4;
      break;
    }

    case 'mushti': {
      fingerStatus.index.targetState = 'bent';
      fingerStatus.index.isCorrect = isBent(sIdx);
      fingerStatus.middle.targetState = 'bent';
      fingerStatus.middle.isCorrect = isBent(sMid);
      fingerStatus.ring.targetState = 'bent';
      fingerStatus.ring.isCorrect = isBent(sRng);
      fingerStatus.pinky.targetState = 'bent';
      fingerStatus.pinky.isCorrect = isBent(sPky);
      fingerStatus.thumb.targetState = 'folded';
      fingerStatus.thumb.isCorrect = sThumb <= 0.75;

      if (!fingerStatus.index.isCorrect || !fingerStatus.middle.isCorrect || !fingerStatus.ring.isCorrect || !fingerStatus.pinky.isCorrect) {
        corrections.push('Curl all four fingers into a tight fist.');
      }
      if (!fingerStatus.thumb.isCorrect) corrections.push('Wrap your thumb across your curled fingers.');

      confidence = ((1 - sIdx) + (1 - sMid) + (1 - sRng) + (1 - sPky) + (1 - sThumb)) / 5;
      break;
    }

    case 'shikhara': {
      fingerStatus.index.targetState = 'bent';
      fingerStatus.index.isCorrect = isBent(sIdx);
      fingerStatus.middle.targetState = 'bent';
      fingerStatus.middle.isCorrect = isBent(sMid);
      fingerStatus.ring.targetState = 'bent';
      fingerStatus.ring.isCorrect = isBent(sRng);
      fingerStatus.pinky.targetState = 'bent';
      fingerStatus.pinky.isCorrect = isBent(sPky);
      fingerStatus.thumb.targetState = 'straight';
      fingerStatus.thumb.isCorrect = isStraight(sThumb);

      if (!fingerStatus.thumb.isCorrect) corrections.push('Raise your thumb straight upward like a mountain peak.');
      if (!fingerStatus.index.isCorrect || !fingerStatus.middle.isCorrect) {
        corrections.push('Keep the other four fingers tightly closed in a fist.');
      }

      confidence = ((1 - sIdx) + (1 - sMid) + (1 - sRng) + (1 - sPky) + sThumb) / 5;
      break;
    }

    case 'suchi': {
      fingerStatus.index.targetState = 'straight';
      fingerStatus.index.isCorrect = isStraight(sIdx);
      fingerStatus.middle.targetState = 'bent';
      fingerStatus.middle.isCorrect = isBent(sMid);
      fingerStatus.ring.targetState = 'bent';
      fingerStatus.ring.isCorrect = isBent(sRng);
      fingerStatus.pinky.targetState = 'bent';
      fingerStatus.pinky.isCorrect = isBent(sPky);

      if (!fingerStatus.index.isCorrect) corrections.push('Point your index finger straight up like a needle.');
      if (!fingerStatus.middle.isCorrect || !fingerStatus.ring.isCorrect) {
        corrections.push('Keep middle, ring, and pinky curled tightly with thumb over them.');
      }

      confidence = (sIdx + (1 - sMid) + (1 - sRng) + (1 - sPky) + (1 - sThumb)) / 5;
      break;
    }

    case 'chandrakala': {
      fingerStatus.index.targetState = 'straight';
      fingerStatus.index.isCorrect = isStraight(sIdx);
      fingerStatus.thumb.targetState = 'straight';
      fingerStatus.thumb.isCorrect = isStraight(sThumb) && distThumbIndex >= 0.12;
      fingerStatus.middle.targetState = 'bent';
      fingerStatus.middle.isCorrect = isBent(sMid);
      fingerStatus.ring.targetState = 'bent';
      fingerStatus.ring.isCorrect = isBent(sRng);
      fingerStatus.pinky.targetState = 'bent';
      fingerStatus.pinky.isCorrect = isBent(sPky);

      if (!fingerStatus.index.isCorrect) corrections.push('Point index finger upward.');
      if (!fingerStatus.thumb.isCorrect) corrections.push('Extend thumb outward to form an L-shaped crescent moon.');
      if (!fingerStatus.middle.isCorrect) corrections.push('Keep remaining fingers curled into the palm.');

      confidence = (sIdx + sThumb + (1 - sMid) + (1 - sRng) + (1 - sPky)) / 5;
      break;
    }

    case 'padmakosha': {
      const curveScore = (s: number) => Math.max(0, 1 - Math.abs(s - 0.62) * 2.5);
      fingerStatus.index.targetState = 'curved';
      fingerStatus.index.isCorrect = isCurved(sIdx);
      fingerStatus.middle.targetState = 'curved';
      fingerStatus.middle.isCorrect = isCurved(sMid);
      fingerStatus.ring.targetState = 'curved';
      fingerStatus.ring.isCorrect = isCurved(sRng);
      fingerStatus.pinky.targetState = 'curved';
      fingerStatus.pinky.isCorrect = isCurved(sPky);

      if (!fingerStatus.index.isCorrect || !fingerStatus.middle.isCorrect) {
        corrections.push('Curve all five fingers inward like a cup holding a lotus bud.');
      }
      if (distIdxMid < 0.03) corrections.push('Separate fingers slightly to shape a round bud.');

      confidence = (curveScore(sIdx) + curveScore(sMid) + curveScore(sRng) + curveScore(sPky)) / 4;
      break;
    }

    case 'ardhachandra': {
      const isWide = distThumbIndex >= 0.13;
      fingerStatus.thumb.targetState = 'spread';
      fingerStatus.thumb.isCorrect = isStraight(sThumb) && isWide;
      fingerStatus.index.targetState = 'straight';
      fingerStatus.index.isCorrect = isStraight(sIdx);
      fingerStatus.middle.targetState = 'straight';
      fingerStatus.middle.isCorrect = isStraight(sMid);
      fingerStatus.ring.targetState = 'straight';
      fingerStatus.ring.isCorrect = isStraight(sRng);
      fingerStatus.pinky.targetState = 'straight';
      fingerStatus.pinky.isCorrect = isStraight(sPky);

      if (!isWide) corrections.push('Stretch your thumb far away from your palm to form a wide crescent.');
      if (!fingerStatus.index.isCorrect || !fingerStatus.middle.isCorrect) {
        corrections.push('Keep all four fingers straight and flush together.');
      }

      confidence = ((sIdx + sMid + sRng + sPky) / 4) * (isWide ? 1.0 : 0.55);
      break;
    }

    case 'alapadma': {
      fingerStatus.pinky.targetState = 'curved';
      fingerStatus.pinky.isCorrect = isCurved(sPky);
      fingerStatus.ring.targetState = 'curved';
      fingerStatus.ring.isCorrect = isCurved(sRng);
      fingerStatus.middle.targetState = 'curved';
      fingerStatus.middle.isCorrect = isCurved(sMid);
      fingerStatus.index.targetState = 'curved';
      fingerStatus.index.isCorrect = isCurved(sIdx);

      const isSeparated = distIdxMid > 0.04 && distMidRng > 0.04;
      if (!isSeparated) corrections.push('Spread each finger wide starting from the pinky to bloom like a lotus.');

      confidence = ((1 - Math.abs(sPky - 0.65)) + (1 - Math.abs(sRng - 0.65)) + (1 - Math.abs(sMid - 0.65)) + (1 - Math.abs(sIdx - 0.65))) / 4;
      break;
    }

    case 'mrigashirsha': {
      const isTouching = distMidThumb < 0.075 && distRngThumb < 0.075;
      fingerStatus.index.targetState = 'straight';
      fingerStatus.index.isCorrect = isStraight(sIdx);
      fingerStatus.pinky.targetState = 'straight';
      fingerStatus.pinky.isCorrect = isStraight(sPky);
      fingerStatus.middle.targetState = 'touching';
      fingerStatus.middle.isCorrect = isTouching;
      fingerStatus.ring.targetState = 'touching';
      fingerStatus.ring.isCorrect = isTouching;

      if (!isTouching) corrections.push('Touch middle and ring fingertips to your thumb tip.');
      if (!fingerStatus.index.isCorrect || !fingerStatus.pinky.isCorrect) {
        corrections.push('Extend index and pinky fingers upright like deer horns.');
      }

      confidence = (sIdx + sPky + (1 - distMidThumb * 10) + (1 - distRngThumb * 10)) / 4;
      break;
    }

    case 'simhamukha': {
      const isTouching = distMidThumb < 0.065 && distRngThumb < 0.065;
      fingerStatus.index.targetState = 'straight';
      fingerStatus.index.isCorrect = isStraight(sIdx);
      fingerStatus.pinky.targetState = 'straight';
      fingerStatus.pinky.isCorrect = isStraight(sPky);
      fingerStatus.middle.targetState = 'touching';
      fingerStatus.middle.isCorrect = isTouching;
      fingerStatus.ring.targetState = 'touching';
      fingerStatus.ring.isCorrect = isTouching;

      if (!isTouching) corrections.push('Join middle and ring fingertips to your thumb tip.');
      if (!fingerStatus.index.isCorrect || !fingerStatus.pinky.isCorrect) {
        corrections.push('Extend index and pinky fingers outward like a lion\'s ears.');
      }

      confidence = (sIdx + sPky + (1 - distMidThumb * 12) + (1 - distRngThumb * 12)) / 4;
      break;
    }

    case 'mukula': {
      const isJoined = distThumbIndex < 0.065 && distMidThumb < 0.065 && distRngThumb < 0.065 && distPkyThumb < 0.065;
      fingerStatus.thumb.targetState = 'touching';
      fingerStatus.thumb.isCorrect = isJoined;
      fingerStatus.index.targetState = 'touching';
      fingerStatus.index.isCorrect = isJoined;
      fingerStatus.middle.targetState = 'touching';
      fingerStatus.middle.isCorrect = isJoined;
      fingerStatus.ring.targetState = 'touching';
      fingerStatus.ring.isCorrect = isJoined;
      fingerStatus.pinky.targetState = 'touching';
      fingerStatus.pinky.isCorrect = isJoined;

      if (!isJoined) corrections.push('Bring all five fingertips together to meet at a single point.');

      const avgDist = (distThumbIndex + distMidThumb + distRngThumb + distPkyThumb) / 4;
      confidence = Math.max(0, 1 - avgDist * 14);
      break;
    }

    case 'trishula': {
      const isTouching = distPkyThumb < 0.07;
      fingerStatus.thumb.targetState = 'touching';
      fingerStatus.thumb.isCorrect = isTouching;
      fingerStatus.pinky.targetState = 'touching';
      fingerStatus.pinky.isCorrect = isTouching;
      fingerStatus.index.targetState = 'straight';
      fingerStatus.index.isCorrect = isStraight(sIdx);
      fingerStatus.middle.targetState = 'straight';
      fingerStatus.middle.isCorrect = isStraight(sMid);
      fingerStatus.ring.targetState = 'straight';
      fingerStatus.ring.isCorrect = isStraight(sRng);

      if (!isTouching) corrections.push('Touch your thumb tip to your pinky finger tip across your palm.');
      if (!fingerStatus.index.isCorrect || !fingerStatus.middle.isCorrect || !fingerStatus.ring.isCorrect) {
        corrections.push('Extend index, middle, and ring fingers completely straight like a trident.');
      }

      confidence = (sIdx + sMid + sRng + (1 - distPkyThumb * 10)) / 4;
      break;
    }

    case 'hamsasya': {
      const isTouching = distThumbIndex < 0.065;
      fingerStatus.index.targetState = 'touching';
      fingerStatus.index.isCorrect = isTouching;
      fingerStatus.thumb.targetState = 'touching';
      fingerStatus.thumb.isCorrect = isTouching;
      fingerStatus.middle.targetState = 'straight';
      fingerStatus.middle.isCorrect = isStraight(sMid);
      fingerStatus.ring.targetState = 'straight';
      fingerStatus.ring.isCorrect = isStraight(sRng);
      fingerStatus.pinky.targetState = 'straight';
      fingerStatus.pinky.isCorrect = isStraight(sPky);

      if (!isTouching) corrections.push('Gently touch the tip of your thumb to the tip of your index finger.');
      if (!fingerStatus.middle.isCorrect || !fingerStatus.ring.isCorrect || !fingerStatus.pinky.isCorrect) {
        corrections.push('Spread and extend middle, ring, and pinky fingers like a swan\'s beak.');
      }

      confidence = Math.max(0, 1 - distThumbIndex * 12) * ((sMid + sRng + sPky) / 3);
      break;
    }

    default: {
      // General fallback evaluator for unspecialized single-hand gestures
      const extCount = [sIdx, sMid, sRng, sPky].filter(isStraight).length;
      confidence = extCount / 4;
      corrections.push(`Adjust fingers to match ${targetMudra} hand reference.`);
      break;
    }
  }

  // Clamping confidence
  confidence = Math.max(0, Math.min(1.0, Math.round(confidence * 100) / 100));

  // Determine feedback string
  let feedback = '';
  if (confidence >= 0.85) {
    feedback = `Perfect ${targetMudra} form. Hold steady!`;
  } else if (confidence >= 0.50) {
    feedback = corrections[0] || `Good alignment. Refine your ${targetMudra} gesture.`;
  } else if (actualBest && actualBest.name !== 'No Mudra Detected' && actualBest.confidence > 0.65) {
    feedback = `Detected ${actualBest.name} instead. ${corrections[0] || `Form ${targetMudra}.`}`;
  } else {
    feedback = corrections[0] || `Align your hand to match ${targetMudra}.`;
  }

  return {
    name: targetMudra,
    confidence,
    feedback,
    fingerStatus,
    corrections,
    detectedMudraName: actualBest?.name || 'No Mudra Detected',
    detectedConfidence: actualBest?.confidence || 0,
  };
}

// -----------------------------------------------------------------------------
// Samyukta (Dual-Hand) Specific Evaluator
// -----------------------------------------------------------------------------
export function getSpecificSamyuktaScore(hand1: Point[], hand2: Point[], targetMudra: string): MudraScore {
  const distWrists = calculateDistance(hand1[0], hand2[0]);
  const distMiddleTips = calculateDistance(hand1[12], hand2[12]);
  const distPalms = calculateDistance(hand1[9], hand2[9]);

  const h1 = classifyMudra(hand1, "Left");
  const h2 = classifyMudra(hand2, "Right");

  const corrections: string[] = [];
  let confidence = 0;
  const normalized = (targetMudra || '').toLowerCase().trim().replace(/[^a-z]/g, '');

  switch (normalized) {
    case 'anjali': {
      const isPataka = (h1.name === "Pataka" || h1.confidence > 0.7) && (h2.name === "Pataka" || h2.confidence > 0.7);
      const isWristsClose = distWrists < 0.12;
      const isTipsClose = distMiddleTips < 0.10;

      if (!isPataka) corrections.push('Keep both hands in flat Pataka mudra.');
      if (!isWristsClose || !isTipsClose) corrections.push('Press both palms and fingertips flush together.');

      confidence = ((h1.confidence + h2.confidence) / 2) * (isWristsClose && isTipsClose ? 1.0 : 0.5);
      break;
    }

    case 'kapota': {
      const isWristsClose = distWrists < 0.12;
      const isTipsClose = distMiddleTips < 0.10;
      const isHollow = distPalms > 0.04;

      if (!isHollow) corrections.push('Hollow the center of your palms so only wrists and fingertips touch.');
      if (!isWristsClose || !isTipsClose) corrections.push('Keep wrists and fingertips touching.');

      confidence = isWristsClose && isTipsClose && isHollow ? 0.92 : 0.55;
      break;
    }

    case 'karkata': {
      const isInterlocked = distWrists < 0.14 && distPalms < 0.08;
      if (!isInterlocked) corrections.push('Interlace the fingers of both hands tightly together.');
      confidence = isInterlocked ? 0.90 : 0.40;
      break;
    }

    case 'swastika':
    case 'swastikadouble': {
      const isCrossed = distWrists < 0.07;
      if (!isCrossed) corrections.push('Cross both wrists over each other while keeping palms in Pataka.');
      confidence = isCrossed ? 0.88 : 0.35;
      break;
    }

    case 'shivalinga': {
      const isPatakaShikhara = (h1.name === "Pataka" && h2.name === "Shikhara") || (h2.name === "Pataka" && h1.name === "Shikhara");
      const isClose = distWrists < 0.16;
      if (!isPatakaShikhara) corrections.push('Hold left hand flat in Pataka and right hand in Shikhara on top.');
      confidence = isPatakaShikhara && isClose ? 0.92 : 0.45;
      break;
    }

    case 'pushpaputa': {
      const isTogether = distWrists < 0.12 && distPalms < 0.10;
      if (!isTogether) corrections.push('Join both hands side-by-side along the pinky edges to form a bowl.');
      confidence = isTogether ? 0.86 : 0.40;
      break;
    }

    case 'matsya': {
      const isStacked = distWrists < 0.10 && distPalms < 0.06;
      if (!isStacked) corrections.push('Stack one palm flat on top of the other with thumbs out like fins.');
      confidence = isStacked ? 0.90 : 0.45;
      break;
    }

    case 'garuda': {
      const distThumbs = calculateDistance(hand1[4], hand2[4]);
      const isThumbsLocked = distThumbs < 0.06;
      if (!isThumbsLocked) corrections.push('Interlock your thumbs and spread both palms wide like wings.');
      confidence = isThumbsLocked ? 0.89 : 0.40;
      break;
    }

    default: {
      confidence = (h1.confidence + h2.confidence) / 2;
      corrections.push(`Align both hands to form ${targetMudra}.`);
      break;
    }
  }

  confidence = Math.max(0, Math.min(1.0, Math.round(confidence * 100) / 100));
  let feedback = '';
  if (confidence >= 0.82) {
    feedback = `Perfect ${targetMudra} posture. Hold steady!`;
  } else {
    feedback = corrections[0] || `Adjust both hands to form ${targetMudra}.`;
  }

  return {
    name: targetMudra,
    confidence,
    feedback,
    corrections,
    detectedMudraName: `${h1.name} & ${h2.name}`,
    detectedConfidence: Math.max(h1.confidence, h2.confidence),
  };
}

// Legacy helper preserved for live free classification
export function classifySamyuktaMudra(hand1: Point[], hand2: Point[]): { name: string; confidence: number; feedback: string } | null {
  const h1 = classifyMudra(hand1, "Left");
  const h2 = classifyMudra(hand2, "Right");
  
  if (!h1 || !h2 || h1.name === "No Mudra Detected" || h2.name === "No Mudra Detected") return null;

  const distWrists = calculateDistance(hand1[0], hand2[0]);
  const distMiddleTips = calculateDistance(hand1[12], hand2[12]);
  const distPalms = calculateDistance(hand1[9], hand2[9]);

  let bestMudra: { name: string; confidence: number; feedback: string } | null = null;
  let maxConfidence = 0;

  const consider = (name: string, confidence: number, feedback: string) => {
    if (confidence > maxConfidence) {
      maxConfidence = confidence;
      bestMudra = { name, confidence, feedback };
    }
  };

  // 1. Anjali
  if (h1.name === "Pataka" && h2.name === "Pataka" && distWrists < 0.12 && distMiddleTips < 0.10) {
    consider("Anjali", (h1.confidence + h2.confidence) / 2, "Beautiful prayer pose. Keep palms pressed.");
  }

  // 2. Kapota
  if (distWrists < 0.12 && distMiddleTips < 0.10 && distPalms > 0.05) {
    consider("Kapota", 0.88, "Good pigeon pose. Center of palms hollowed.");
  }

  // 3. Karkata
  if (distWrists < 0.14 && distPalms < 0.08) {
    consider("Karkata", 0.85, "Fingers interlocked tightly.");
  }

  // 4. Swastika
  if (distWrists < 0.06) {
    consider("Swastika", 0.85, "Good crossed wrists.");
  }

  // 5. Shivalinga
  if ((h1.name === "Pataka" && h2.name === "Shikhara") || (h2.name === "Pataka" && h1.name === "Shikhara")) {
    consider("Shivalinga", 0.90, "Excellent Shivalinga. Base flat with thumb raised.");
  }

  // 6. Pushpaputa
  if (distWrists < 0.12 && distPalms < 0.10) {
    consider("Pushpaputa", 0.82, "Flower offering bowl formed by both hands.");
  }

  // 7. Matsya
  if (distWrists < 0.10 && distPalms < 0.06) {
    consider("Matsya", 0.88, "Palms stacked with thumbs extended like fins.");
  }

  // 8. Garuda
  const distThumbs = calculateDistance(hand1[4], hand2[4]);
  if (distThumbs < 0.06 && distWrists < 0.15) {
    consider("Garuda", 0.88, "Thumbs interlocked and wings spread wide.");
  }

  return maxConfidence > 0.5 ? bestMudra : null;
}
