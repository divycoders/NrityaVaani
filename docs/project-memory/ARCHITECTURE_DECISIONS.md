# Architecture Decision Records (ADRs) — NrityaVaani

This document records the foundational technical and architectural decisions for NrityaVaani. These decisions are binding and must not be silently reversed.

---

### ADR-001: Teaching-First UI over Camera-First Evaluation
- **Context:** The original repository opened with a live camera evaluator and posture grader. Beginners found this intimidating, stressful, and disorienting.
- **Decision:** Shift platform focus entirely to **Teaching-First**. The primary user experience centers on the 3D Virtual Guru, step-by-step narration, and concept visualization. Camera evaluation is preserved as an optional `/practice` utility.
- **Consequences:** Significantly lowered barrier to entry; improved diaspora engagement; eliminated camera permission friction on onboarding.

---

### ADR-002: Dual-Figure Three.js Architecture (`MocapFigure` vs `NamasteFigure`)
- **Context:** Posed stationary figures and dynamic frame-by-frame motion clips have different rendering loop requirements. Folding them into one component caused render loop stalls or 60 FPS battery drain on still poses.
- **Decision:** Maintain two distinct Three.js components:
  1. `MocapFigure.tsx`: Driven 60 times/sec from decoded `.nvclip` joint vectors with scrubber timeline and camera controls.
  2. `NamasteFigure.tsx`: Stationary Three.js canvas optimized for still postures, alignment inspection, and concept diagrams.
- **Consequences:** Clean separation of concerns; zero animation jitter; optimal CPU/GPU usage on mobile and laptops.

---

### ADR-003: Separation of Motion Data (`.nvclip`) from Manifest Metadata (`.json`)
- **Context:** Early prototypes embedded cue strings and timings inside binary clip headers. Correcting a typo or translating a cue required re-baking 1.3 MB of joint rotations.
- **Decision:** Store joint rotations in `.nvclip` binary buffers and all textual cues, steps, and timings in lightweight JSON manifests (`namaskaram.json`, `thattadavu.json`).
- **Consequences:** Copy changes and multilingual translations require zero 3D re-bakes; static caching of large binary assets via CDN.

---

### ADR-004: Multilingual Voice Architecture & Zero-Overlap Audio Engine
- **Context:** Multiple audio elements (chapter narration and conversational chat) caused conflicting speech overlap. Auto-playing audio on page load violated browser policies and annoyed users.
- **Decision:**
  1. Centralize all audio through `GuruAudioEngine`.
  2. Enforce **Zero Autoplay** (user must click "Listen to Guru").
  3. Enforce **Zero Audio Overlap** via `GuruAudioEngine.stopAllAudio()`.
  4. Coordinate Goonj Neural TTS with browser Web Speech API fallback.
- **Consequences:** Reliable playback across all browsers; no overlapping voices; graceful degradation when backend TTS is unreachable.

---

### ADR-005: 14 Indian Regional Languages Catalog with Classical Terminology Preservation
- **Context:** Generic machine translation translates sacred terms into confusing literal words (e.g. translating "Aramandi" into "half-sitting" or "Pataka" into "flag").
- **Decision:** Implement `languageCatalog.ts` covering 14 Indian languages, with strict regex preservation rules keeping classical terms (*Aramandi, Samapada, Pataka, Tatta Adavu, Natta Adavu, Sollukattu, Adi Tala*) in their original transliterated form across Hindi, Tamil, and Telugu scripts.
- **Consequences:** Pedagogically authentic vernacular explanations; prevents linguistic bastardization of classical dance terms.

---

### ADR-006: Deterministic Shastric Knowledge Fallback over Unconstrained LLM Generation
- **Context:** LLMs hallucinate dance postures, invent non-existent Sanskrit verses, or claim fictional guru endorsements. Cloud AI providers also face rate-limiting and 401/429 errors.
- **Decision:** Implement a rule-based deterministic fallback (`guru_assistant.py` in Python, `guruSynthesizer.ts` in TypeScript) covering 8 core classical categories. If the LLM provider fails, times out, or hallucinates, the system immediately returns verified Shastric knowledge.
- **Consequences:** 100% uptime for core Bharatanatyam inquiries; zero fabricated citations; robust production safety.

---

### ADR-007: Zero-Dependency Markdown Parsing (`markdownParser.ts`)
- **Context:** Heavy third-party Markdown libraries (`react-markdown`, `marked`) introduced complex dependency trees and caused Node test runner issues. Raw Markdown tokens (`**bold**`) were leaking into the UI.
- **Decision:** Author lightweight, zero-dependency tokenizer and AST builder (`markdownParser.ts`) paired with `GuruMarkdown.tsx`.
- **Consequences:** Zero runtime dependency bloat; 100% testable via pure Node.js test runner; safe HTML link sanitization against XSS.

---

### ADR-008: Local Privacy-First Progress Tracking via `localStorage`
- **Context:** Requiring cloud accounts or database logins created onboarding friction and raised student privacy concerns.
- **Decision:** Manage curriculum progress, completed chapters, and formative quiz results locally via `CurriculumProgressService.ts` in browser `localStorage`.
- **Consequences:** Zero tracking cookies; no mandatory sign-up to learn; instant offline state preservation.

---

### ADR-009: Strict Two-Stage Git Collaboration Workflow
- **Context:** Cross-machine development resulted in git commit divergence, unverified work being pushed, and untracked datasets being accidentally staged.
- **Decision:** Enforce a strict protocol where Antigravity NEVER commits or pushes code during normal turns. A commit and push is executed ONLY upon receiving the explicit user phrase: `VERIFIED — COMMIT AND PUSH`.
- **Consequences:** Clean Git history; zero accidental commits; guaranteed test verification before every push.
