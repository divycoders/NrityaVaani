# AGENTS.md — Permanent Antigravity Instructions for NrityaVaani

Welcome to **NrityaVaani** (नृत्यवाणी).

This document defines the **permanent, mandatory operating rules** for every Antigravity AI agent, subagent, and human developer working in this repository. These rules apply across all machines, sessions, and newly initiated conversations.

---

## 1. MANDATORY STARTUP PROTOCOL (BEFORE WRITING A SINGLE LINE OF CODE)

Whenever you begin a turn or start a new Antigravity session in this repository, you **MUST** follow this sequence in order:

1. **Read this file (`AGENTS.md`)** completely to re-anchor your operational boundaries.
2. **Read the project memory**:
   - `docs/project-memory/SESSION_HANDOFF.md` — What was just done, what is next, and handoff instructions.
   - `docs/project-memory/CURRENT_STATE.md` — Active branch, commit hash, verified vs in-progress features, and known bugs.
   - `docs/project-memory/DEVELOPMENT_ROADMAP.md` — Current phase status and upcoming deliverables.
   - `docs/project-memory/ARCHITECTURE_DECISIONS.md` — Established architectural decisions that must not be silently reversed.
3. **Inspect the Git status and working tree**:
   - Run `git status` to see unstaged, staged, and untracked changes.
   - Run `git log -1 --oneline` to see the latest committed state.
   - Confirm you are on `feature/teaching-first-virtual-guru` (or the designated active branch).
4. **Understand the last completed task**:
   - Read `docs/project-memory/LAST_PROMPT.md` and `docs/project-memory/LAST_REPORT.md`.
5. **Check pending tasks and known limitations**:
   - Do not re-implement or repeat work that has already been completed.
   - Do not remove or overwrite working subsystems.
6. **Preserve existing work and user decisions**:
   - Never run `git reset --hard`, `git clean -fd`, or destructive commands.
   - Preserve all existing user modifications and untracked datasets (`Bharatanatyam-Mudra-Dataset-master/`).

---

## 2. CORE PRODUCT PHILOSOPHY & NON-NEGOTIABLE CONVENTIONS

NrityaVaani is an **AI-powered Indian classical dance teaching platform centered on an interactive 3D Virtual Guru**, beginning with Bharatanatyam.

### 2.1 Teaching-First, Never Camera-Forced
- NrityaVaani is **NOT** a camera-first gesture evaluation grader.
- The learner must never be forced into camera analysis, posture grading, or scored drills.
- Learning, observing the 3D Guru, practicing at personal tempo, and asking questions are always the primary experience. Camera evaluation is strictly an optional practice utility.

### 2.2 3D Virtual Guru as Primary Teacher
- The 3D Virtual Guru is the focal point of every lesson (commanding ~70% of the viewport).
- Lessons are taught through **structured voice narration**, **interactive 3D movement demonstrations**, **conceptual visualizers**, and **progressive disclosure**.
- **Do not create text-heavy pages** that force learners to scroll through walls of text. Keep text secondary, concise (2–3 sentences), and house deep Shastric references in expandable drawers.

### 2.3 Audio Rules: Zero Autoplay & Zero Overlap
- **Zero Autoplay**: Audio must never autoplay on page load or chapter switch. The user explicitly initiates listening via the "Listen to Guru" button.
- **Zero Audio Overlap**: Chapter narration and conversational chat speech must never speak simultaneously. Always coordinate through `GuruAudioEngine.stopAllAudio()`.

### 2.4 Classical Integrity & Shastric Grounding
- All terminology, hand gestures, adavus, and viniyogas must be grounded in primary classical texts (*Bharata Muni's Natya Shastra* and *Nandikeshvara's Abhinaya Darpana*) and living Bani parampara (*Kalakshetra* and *Tanjavur/Pandanallur*).
- **Never fabricate** Sanskrit verses, historical claims, guru endorsements, or imaginary mudra usages.
- For movements where authentic studio motion capture is not yet recorded (e.g. *Natta Adavu*), honestly display the **Mocap in Production** status. Never substitute fake procedural animations or ragdolls for authentic classical dance.

---

## 3. STRICT TWO-STAGE GIT COLLABORATION WORKFLOW

Antigravity operates across multiple machines (e.g. personal laptop, secondary laptop). To prevent merge conflicts, data loss, and unverified commits, adhere strictly to this protocol:

### Stage 1: Implementation & Verification (Antigravity's Job)
During regular development turns, you **MUST NOT**:
- Run `git commit`
- Run `git push` or `git push --force`
- Run `git reset` or `git checkout .`
- Create unauthorized branches

Instead:
1. Implement the requested code safely.
2. Run automated tests: `npm --prefix frontend test` and `python -m unittest discover -s backend/tests -v`.
3. Run static checks: `npx --prefix frontend tsc --project frontend/tsconfig.json --noEmit` and `npm --prefix frontend run lint`.
4. Update the project memory files in `docs/project-memory/`.
5. Present a clear implementation report showing test results, git diff summary, and known limitations.
6. **Stop and wait for the user's explicit verification.**

### Stage 2: Commit & Push (ONLY Upon Explicit Authorization)
You may **ONLY** commit and push when the user provides the **EXACT** confirmation phrase:

> `VERIFIED — COMMIT AND PUSH`

Ordinary phrases such as *"looks good"*, *"thanks"*, *"continue"*, or *"proceed"* **DO NOT** authorize a commit.

When (and only when) `VERIFIED — COMMIT AND PUSH` is received:
1. Verify clean test and build status.
2. Stage only relevant project files (never stage `.env`, credentials, or `Bharatanatyam-Mudra-Dataset-master/`).
3. Commit with a clear Conventional Commit message (e.g. `feat(classroom): implement voice-led 3d virtual classroom`).
4. Push to origin on the active feature branch: `git push origin feature/teaching-first-virtual-guru`.
5. Update `CURRENT_STATE.md` and `WORK_LOG.md` with the new commit hash.

---

## 4. MULTI-COMPUTER RESUMPTION PROTOCOL

When the user switches to a different laptop:
1. Clone / open the repository.
2. Checkout `feature/teaching-first-virtual-guru`.
3. Check `git status` and fetch remote changes. Ensure no local uncommitted changes are overwritten.
4. Read `docs/project-memory/SESSION_HANDOFF.md` to see the exact state where the previous machine left off.
5. Resume seamlessly without asking redundant setup questions.

---

*This document is authoritative for all AI interactions in the NrityaVaani repository.*
