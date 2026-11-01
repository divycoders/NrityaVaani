# Permanent Workflow Rules — NrityaVaani

This document details the operational rules and standards for all agents and contributors working on NrityaVaani.

---

## 1. PRE-FLIGHT CHECKLIST (Every Turn)

Before proposing, editing, or executing any code:
- [ ] Check active branch (`git branch --show-current`). Must be `feature/teaching-first-virtual-guru` unless instructed otherwise.
- [ ] Inspect working tree (`git status --short`). Ensure untracked dataset `Bharatanatyam-Mudra-Dataset-master/` is untouched.
- [ ] Check last commit hash (`git log -1 --format="%h %s"`).
- [ ] Review `docs/project-memory/SESSION_HANDOFF.md` and `docs/project-memory/CURRENT_STATE.md`.
- [ ] Confirm the immediate goal and avoid re-doing verified features.

---

## 2. CODE IMPLEMENTATION STANDARDS

### Frontend (Next.js 16 / React 19 / TypeScript)
- Use strict TypeScript types. Never use `any` unless strictly interfacing with an untyped external library, and narrow it immediately.
- Prevent SSR hydration errors for Three.js canvases by using dynamic imports with `{ ssr: false }`.
- Follow the established design system: warm dark aesthetic, editorial typography (`serif`, `mono`, `sans`), subtle borders, gold accents (`primary`).
- Preserve responsiveness: test layout across mobile (375px), tablet (768px), and desktop (1280px+).

### Backend (FastAPI / Python 3.10+)
- Keep endpoints lightweight, stateless, and resilient.
- All TTS and AI provider calls must have deterministic, zero-network fallbacks so the frontend never crashes when external providers fail or rate-limit.
- Validate inputs strictly (e.g., query strings $\le$ 500 characters).

### 3D Motion & Kinematics (Three.js / MediaPipe)
- Maintain separation between motion rotations (`.nvclip`) and descriptive manifest data (`.json`).
- When playing motion clips, ensure playback speed controls (`0.5x`, `0.75x`, `1.0x`) scale timestamps cleanly without accumulated drift.
- Transparently declare in-production motion assets. Never fake animation clips.

---

## 3. VERIFICATION & QUALITY GATES

A development phase is **NEVER** marked as verified until all quality gates pass:
1. **Frontend Test Suite**: `npm --prefix frontend test` must exit code 0.
2. **Backend Test Suite**: `python -m unittest discover -s backend/tests -v` must exit code 0.
3. **TypeScript Compilation**: `npx --prefix frontend tsc --project frontend/tsconfig.json --noEmit` must produce 0 errors.
4. **Frontend Linting**: `npm --prefix frontend run lint` must produce 0 errors.
5. **Next.js Production Build**: `npm --prefix frontend run build` must compile all routes successfully.

---

## 4. STRICT GIT COMMIT PROTOCOL

- **No Commit Without Explicit Command**: Never commit code until the user explicitly sends `VERIFIED — COMMIT AND PUSH`.
- **Exclusion List**: The following must NEVER be committed:
  - `Bharatanatyam-Mudra-Dataset-master/` (local dataset)
  - `.env`, `.env.local`, `.env.production` (environment variables and API keys)
  - `node_modules/`, `__pycache__/`, `.next/`
  - Scratch scripts in conversation brain directories
- **Commit Message Format**:
  - `feat(<scope>): <description>`
  - `fix(<scope>): <description>`
  - `docs(<scope>): <description>`
  - `test(<scope>): <description>`
  - `refactor(<scope>): <description>`

---

## 5. DOCUMENTATION & MEMORY SYNCHRONIZATION

Whenever a task completes:
1. Update `docs/project-memory/CURRENT_STATE.md`.
2. Update `docs/project-memory/DEVELOPMENT_ROADMAP.md`.
3. Append a new entry to `docs/project-memory/WORK_LOG.md`.
4. Update `docs/project-memory/LAST_PROMPT.md` and `docs/project-memory/LAST_REPORT.md`.
5. Update `docs/project-memory/SESSION_HANDOFF.md`.
6. Archive task files into `docs/project-memory/task-history/` and `docs/project-memory/reports/`.
