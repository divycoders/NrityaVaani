# Current Repository State — NrityaVaani

**Last Updated:** 2026-11-01  
**Status Assessment:** Production Hardened, Committed & Pushed to Remote (`origin/feature/teaching-first-virtual-guru`)

---

## 1. GIT METADATA
- **Current Branch:** `feature/teaching-first-virtual-guru`
- **Latest Commit Hash:** `5f85cca454eea61962bdf24511e20882bad6b80c`
- **Commit Subject:** `feat(classroom): implement voice-led 3D virtual classroom and project memory system`
- **Remote:** `origin/feature/teaching-first-virtual-guru` (tracked and up to date)
- **Working Tree State:** Clean (excluding untracked local dataset `Bharatanatyam-Mudra-Dataset-master/`).

---

## 2. PHASE COMPLETION STATUS
- **Phase 1 (Safety Checks & Audit):** VERIFIED & COMMITTED.
- **Phase 2 (Core Voice & 3D Guru Stabilization):** VERIFIED & COMMITTED.
- **Phase 3 (Teaching-First UI/UX Redesign):** VERIFIED & COMMITTED.
- **Phase 4 (Structured Bharatanatyam Curriculum):** VERIFIED & COMMITTED.
- **Phase 5 (Guru Knowledge Foundation & Provenance):** VERIFIED & COMMITTED.
- **Phase 6 (Interactive Virtual Guru Assistant):** VERIFIED & COMMITTED.
- **Phase 7 (AI Reliability & Production Hardening):** VERIFIED & COMMITTED.
- **Phase 8 (Demonstrating Virtual Guru 3D Player):** VERIFIED & COMMITTED.
- **Phase 8.1 (Markdown UI, Regional Languages & Voice):** VERIFIED & COMMITTED.
- **Phase 9 (Voice-Led 3D Virtual Classroom):** VERIFIED & COMMITTED.
- **Phase 10 (Permanent Project Memory & Multi-Computer Git System):** VERIFIED & COMMITTED.

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

## 6. MULTI-COMPUTER RESUMPTION STATUS
- **Active Branch:** `feature/teaching-first-virtual-guru`
- **Remote Push Status:** Pushed and tracking `origin/feature/teaching-first-virtual-guru`.
- **Ready for Next Task:** Safe to switch computers or resume on next sprint.
