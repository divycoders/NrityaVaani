# Current Repository State — NrityaVaani

**Last Updated:** November 2026  
**Status Assessment:** Production Hardened & Test-Verified (Awaiting User Review for Phase 9 Commit)

---

## 1. GIT METADATA
- **Current Branch:** `feature/teaching-first-virtual-guru`
- **Latest Commit Hash:** `cc0b3785a6a35b43972c73608aea972f1abebe41` (Author: DivyCoders, Date: Sun Sep 20 12:08:11 2026 +0530, Subject: `Update README.md`)
- **Remote:** Origin connected to GitHub (`divycoders/NrityaVaani`).
- **Working Tree State:** Dirty (Working tree contains uncommitted Phase 1–9 implementations and project memory system; preserved according to strict safety rules).

---

## 2. PHASE COMPLETION STATUS
- **Phase 1 (Safety Checks & Audit):** VERIFIED.
- **Phase 2 (Core Voice & 3D Guru Stabilization):** VERIFIED (Kartarimukha classification fix, Goonj TTS error handling, lint script fix).
- **Phase 3 (Teaching-First UI/UX Redesign):** VERIFIED (Hero preview, curriculum navigation, editorial components, optional practice deemphasized).
- **Phase 4 (Structured Bharatanatyam Curriculum):** VERIFIED (6 levels, 13 lessons, syllabus mapping, Namaskaram, Thattadavu, Natta Adavu in-production).
- **Phase 5 (Guru Knowledge Foundation & Provenance):** VERIFIED (Provenance registry, source citations from *Natya Shastra* and *Abhinaya Darpana*).
- **Phase 6 (Interactive Virtual Guru Assistant):** VERIFIED (Conversational assistant with classical dance grounding and Natta Adavu distinction).
- **Phase 7 (AI Reliability & Production Hardening):** VERIFIED (Deterministic rule fallback, input sanitization <= 500 chars, output capping <= 1200 chars).
- **Phase 8 (Demonstrating Virtual Guru 3D Player):** VERIFIED (Multi-speed playback, camera viewpoints: front, side, 3/4, step context sync).
- **Phase 8.1 (Markdown UI, Regional Languages & Voice):** VERIFIED (Zero-dependency Markdown parser, 14 Indian languages, classical terminology preservation, TTS cleanup).
- **Phase 9 (Voice-Led 3D Virtual Classroom):** IMPLEMENTED & AUTOMATED TEST VERIFIED (Authored in working tree, 63 frontend tests + 26 backend tests passing, `next build` clean, awaiting user review and explicit commit command).

---

## 3. WORKING FEATURES (INSPECTION & TEST VERIFIED)
1. **Unified Virtual Classroom (`VirtualClassroom.tsx`)**:
   - Replaces fragmented lesson players with a unified 3D Virtual Classroom for all 13 curriculum lessons.
   - Automatically adapts 3D stage based on visual mode: `mocap-3d`, `posture-3d`, `concept-triad`, `rhythm-meter`, or `mocap-in-production`.
2. **8-Chapter Teaching Sequence (`lessonChapters.ts`)**:
   - Generates 8 structured chapters for every curriculum lesson: Guru Intro, Foundation, Demo, Details, Safety, Recap, Quiz, and Next Steps.
3. **Voice Narration Engine (`guruAudioEngine.ts`)**:
   - Goonj Neural TTS integration with Web Speech fallback.
   - Enforces Zero Autoplay and Zero Audio Overlap (`stopAllAudio()`).
   - Multi-speed narration (`0.5x`, `0.75x`, `1.0x`) and live subtitle captioning.
4. **Interactive Concept Visualizers**:
   - `NrittaNrityaVisualizer.tsx`: Interactive triad comparison.
   - `AdiTalaVisualizer.tsx`: 8-beat Carnatic Tala visualizer with real-time pulse and Sollukattu.
   - `PostureAlignmentVisualizer.tsx`: Aramandi diamond geometry and anatomical checkpoints.
5. **Dynamic Lesson-Specific Suggestions (`lessonSuggestions.ts`)**:
   - Context-aware prompt suggestions for `GuruChatPanel.tsx` tailored per lesson and language.
6. **14 Indian Regional Languages Catalog (`languageCatalog.ts`)**:
   - Native script verification, neural voice vs text-only classification, and classical terminology preservation rules.
7. **Formative Assessment & Local Progress**:
   - Chapter 7 interactive multiple-choice quiz with immediate feedback.
   - Browser `localStorage` progress persistence via `CurriculumProgressService.ts`.
8. **MediaPipe Classification (`classification.py` & `classification.ts`)**:
   - Distinguishes Kartarimukha (spread V-shape) from Ardhapataka (closed fingers).

---

## 4. INCOMPLETE FEATURES & STUDIO PRODUCTION NEEDS
1. **Studio Motion Capture Takes for Levels 2–6**:
   - Authentic `.nvclip` motion recordings currently exist only for *Namaskaram* and *Thattadavu*.
   - Lessons such as *Natta Adavu*, *Kuditta Mettu*, and *Alarippu* are honestly marked as `mocap-in-production` with authenticated theory and footwork cues.
2. **Backend Neural TTS Proxy Availability**:
   - Live Edge-TTS requires Python FastAPI backend or Render backend. When backend is unreachable, browser Web Speech API provides a reliable client-side fallback.
3. **Mudra 3D Rigs in Library**:
   - 18 of 28 Asamyukta Hastas and 10 of 24 Samyukta Hastas have keyed 3D models in the digital library; remaining mudras display verified classical descriptions and viniyogas.

---

## 5. KNOWN BUGS & MITIGATIONS
1. **Edge-TTS Upstream 403 Blocking**:
   - Microsoft Edge-TTS occasionally returns 403 on cloud proxies or rate-limiting networks.
   - *Mitigation:* `guruAudioEngine.ts` and `goonj_tts.py` catch failures gracefully and fall back to browser Web Speech API.
2. **Camera Lighting Sensitivity (`/live`, `/practice`)**:
   - MediaPipe Tasks-Vision hand and pose tracking degrades in low-light environments.
   - *Mitigation:* Frontend displays lighting advisories and calibration cues.

---

## 6. PENDING VERIFICATION & NEXT IMMEDIATE ACTION
- **Pending:** User review of the Phase 9 implementation and permanent project memory system.
- **Immediate Next Task:** Upon user providing `VERIFIED — COMMIT AND PUSH`, stage the validated project files, commit with a conventional message, push to GitHub, and update commit hashes.
