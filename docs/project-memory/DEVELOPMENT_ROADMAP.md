# Development Roadmap — NrityaVaani

This document tracks all project phases, their exact objectives, deliverables, and current status.

---

## Phase Status Summary

| Phase | Title | Status | Deliverables |
| :---: | :--- | :---: | :--- |
| **Phase 1** | Repository Safety Checks & Audit | **Verified** | Git branch audit, safety baseline, baseline checks |
| **Phase 2** | Core Voice & 3D Guru Architecture Stabilization | **Verified** | Kartarimukha fix, Goonj TTS error handling, lint command fix |
| **Phase 3** | Teaching-First UI/UX Redesign | **Verified** | Landing page redesign, hero preview, curriculum navigation |
| **Phase 4** | Structured Bharatanatyam Teaching Curriculum | **Verified** | 6-level syllabus, 13 lessons, Namaskaram, Thattadavu |
| **Phase 5** | Guru Knowledge Foundation & Provenance | **Verified** | Classical provenance registry, Shastric citations |
| **Phase 6** | Interactive Virtual Guru Assistant | **Verified** | Knowledge-grounded chat assistant, Natta Adavu distinction |
| **Phase 7** | AI Reliability & Production Hardening | **Verified** | Deterministic rule fallback, input sanitization, rate handling |
| **Phase 8** | Demonstrating Virtual Guru 3D Experience | **Verified** | Multi-speed playback, camera viewpoints, step synchronization |
| **Phase 8.1** | Virtual Guru Polish: Markdown UI & Languages | **Verified** | Zero-dependency Markdown parser, 14 Indian languages, voice polish |
| **Phase 9** | Voice-Led 3D Virtual Classroom | **Implemented** | Unified 3D classroom, 8-chapter pedagogy, visualizers, quiz |
| **Phase 10** | Student Mirror Mode & Spatial Alignment | *Planned* | Split-screen camera reflection, real-time skeleton overlay |
| **Phase 11** | 3D Mudra Library Completion | *Planned* | Remaining 10 Asamyukta and 14 Samyukta 3D hand models |
| **Phase 12** | Studio Mocap Expansion (Levels 2–6) | *Planned* | Authentic studio mocap takes for Natta Adavu & Kuditta Mettu |

---

## Detailed Phase Breakdown

### Phase 1: Repository Safety Checks & Audit
- **Objective:** Inspect working tree, branch health, and baseline errors without modifying application code.
- **Status:** Verified.
- **Key Deliverables:** Switched to `feature/teaching-first-virtual-guru`, preserved untracked dataset, documented baseline state.

### Phase 2: Core Voice & 3D Guru Architecture Stabilization
- **Objective:** Fix classification ordering bug and harden Goonj TTS error recovery.
- **Status:** Verified.
- **Key Deliverables:** Fixed unreachable Kartarimukha condition in `classification.py`; added regression tests; added graceful error handling for Edge-TTS 403 errors; fixed `frontend/package.json` lint script.

### Phase 3: Teaching-First UI/UX Redesign
- **Objective:** Transition platform from camera-evaluation tool into teaching-first 3D learning platform.
- **Status:** Verified.
- **Key Deliverables:** Redesigned landing page with `GuruHeroPreview`, editorial typography, curriculum navigation, deemphasized camera scoring.

### Phase 4: Structured Bharatanatyam Teaching Curriculum
- **Objective:** Author a coherent beginner-friendly Bharatanatyam curriculum.
- **Status:** Verified.
- **Key Deliverables:** Created `curriculumData.ts` with 6 levels and 13 lessons; documented syllabus requirements; established honest in-production status for Natta Adavu.

### Phase 5: Guru Knowledge Foundation & Content Provenance
- **Objective:** Ensure academic and classical accuracy of all dance content.
- **Status:** Verified.
- **Key Deliverables:** Created `provenance.ts` mapping each lesson to *Natya Shastra* and *Abhinaya Darpana* source verses; established validation status tags (`source-supported`, `guru-review-required`, `in-production`).

### Phase 6: Interactive Virtual Guru Assistant
- **Objective:** Enable conversational Q&A grounded in classical dance literature.
- **Status:** Verified.
- **Key Deliverables:** Created `knowledgeRetriever.ts`, `guruSynthesizer.ts`, `GuruChatPanel.tsx`; supported inquiries regarding Aramandi, Pataka, Namaskaram, and curriculum progression.

### Phase 7: AI Reliability & Production Hardening
- **Objective:** Ensure system robustness against AI provider failures, timeouts, and hallucinations.
- **Status:** Verified.
- **Key Deliverables:** Deterministic rule-based fallback answering 8 core classical categories; input length validation (<= 500 chars); output capping (<= 1200 chars); 12 automated reliability tests.

### Phase 8: Demonstrating Virtual Guru 3D Player
- **Objective:** Turn 3D Guru into an interactive movement instructor.
- **Status:** Verified.
- **Key Deliverables:** Scrubber timeline, step navigation pills, camera angle presets (Front, Side 90°, 3/4 Perspective), speed controls (`0.5x`, `0.75x`, `1.0x`), step-aware chat suggestions.

### Phase 8.1: Virtual Guru Polish: Markdown UI, Regional Languages & Voice
- **Objective:** Fix raw Markdown UI display, support 14 Indian regional languages, and improve natural speech cadence.
- **Status:** Verified.
- **Key Deliverables:** Built zero-dependency `markdownParser.ts` and `GuruMarkdown.tsx`; created `languageCatalog.ts` for 14 Indian languages; enforced classical terminology preservation; inserted Sollukattu pauses in speech.

### Phase 9: Voice-Led 3D Virtual Classroom
- **Objective:** Elevate 3D Virtual Guru to primary teacher across all lessons with voice narration and progressive text disclosure.
- **Status:** Implemented in working tree; 63 frontend + 26 backend tests passing; awaiting user verification.
- **Key Deliverables:** Created `VirtualClassroom.tsx` unifying `/learn/[dance]/[lesson]`; authored 8-chapter sequence per lesson in `lessonChapters.ts`; created `NrittaNrityaVisualizer`, `AdiTalaVisualizer`, `PostureAlignmentVisualizer`; zero autoplay and zero audio overlap; formative understanding check quiz.

### Phase 10: Student Mirror Mode & Spatial Alignment (Planned)
- **Objective:** Provide side-by-side student camera mirror alongside the 3D Guru without grading or judgment.
- **Status:** Planned.
- **Dependencies:** User verification of Phase 9.

### Phase 11: 3D Mudra Library Completion (Planned)
- **Objective:** Rig and animate remaining 10 Asamyukta and 14 Samyukta Hastas in Three.js.
- **Status:** Planned.

### Phase 12: Studio Mocap Pipeline Expansion (Planned)
- **Objective:** Record, clean, and bake authentic studio mocap takes for Natta Adavu, Kuditta Mettu, and Alarippu.
- **Status:** Planned.
