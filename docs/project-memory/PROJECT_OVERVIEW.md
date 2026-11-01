# Project Overview — NrityaVaani (नृत्यवाणी)

## 1. Product Vision
NrityaVaani is an AI-powered Indian classical dance learning platform centered on an interactive 3D Virtual Guru. The platform preserves, digitizes, and democratizes classical dance pedagogy—starting with Bharatanatyam—making disciplined, authentic training accessible to any student worldwide regardless of geography, financial means, or prior experience.

---

## 2. Problem Being Solved
1. **High Barrier to Entry**: Classical dance training typically requires physical access to traditional gurukuls or private academies, which are costly and geographically concentrated in major urban centers.
2. **Limitations of 2D Video Learning**: Video platforms (e.g. YouTube) provide flat, non-interactive angles. Students cannot rotate around a dancer to observe critical 3D geometry such as the 90° profile in Aramandi, spine alignment (Saushtava), or finger placement in mudras.
3. **Flawed "Camera-First" Evaluation Apps**: Existing AI dance tools force students to immediately dance in front of a webcam and be graded by computer vision. This intimidates beginners, causes anxiety, and mistakes superficial joint tracking for genuine classical understanding.
4. **Language & Cultural Barriers**: Most classical resources are published either exclusively in English or in high Sanskrit/Tamil without pedagogical translation, alienating native speakers across northern, eastern, and western India.

---

## 3. Target Users
- **Novice Learners & Beginners**: Individuals learning classical dance for the first time who require patient, non-judgmental, step-by-step guidance.
- **Indian Diaspora & Global Students**: Learners outside India seeking authentic classical grounding, lineage respect, and cultural context.
- **Practicing Students (Sadhakas)**: Enrolled dancers who use NrityaVaani between weekly guru classes to revise adavus, study Shastric terminology, and check anatomical alignment.
- **Dance Teachers & Academies**: Natyacharyas seeking standardized 3D visual references and rhythm tools for their students.

---

## 4. Teaching-First Philosophy
NrityaVaani is founded on the non-negotiable principle: **Learning precedes evaluation**.
- Dance is a sacred sadhana (disciplined practice) requiring body awareness, geometric understanding, and rhythmic internalisation.
- The 3D Virtual Guru is an instructor, guide, and mentor—not an automated examiner.
- Camera evaluation is strictly an **optional utility** (`/practice`, `/live`), never a prerequisite or forced gate to access lessons.

---

## 5. The 3D Virtual Guru Concept
The Virtual Guru is an interactive, animated 3D embodiment available in dual-gender rigs:
- **Guru Meera**: Female classical dancer avatar (warm, encouraging, precise).
- **Guru Arjun**: Male Natyacharya avatar (dynamic, commanding, grounding).

The Guru teaches through:
- **Voice-Led Narration**: Speaking explanations in the learner's chosen language with Goonj Neural TTS.
- **3D Movement Demonstrations**: Demonstrating adavus frame-by-frame with full camera orbit and speed control.
- **Conceptual Visualizers**: Breaking down complex aesthetic triads (Nritta, Nritya, Natya) and rhythmic meters (Adi Tala).
- **Conversational Q&A**: Answering classical inquiries grounded in *Natya Shastra* and *Abhinaya Darpana*.

---

## 6. Core Features
1. **Voice-Led 3D Virtual Classroom (`/learn/[dance]/[lesson]`)**:
   - Central 3D Guru visual stage (70% viewport).
   - Structured 8-chapter pedagogy sequence: Guru Intro, Concept Foundation, Visual Demo, Technique Cues, Common Mistakes & Safety, Recap, Formative Quiz, and Next Steps.
   - Active narration controls: Play/pause, speed (`0.5x`, `0.75x`, `1.0x`), replay, and closed captioning.
2. **Interactive Concept Visualizers**:
   - *Nritta / Nritya / Natya Triad Visualizer*: Interactive breakdown of pure dance, expressive dance, and theatrical drama.
   - *Adi Tala Rhythmic Visualizer*: 8-beat Carnatic cycle with live pulse, Laghu finger counts, and Dhrutam wave actions.
   - *Aramandi Posture Alignment Visualizer*: Anatomical alignment checkpoints for vertical spine, hip turnout, and knee-toe tracking.
3. **Interactive 3D Mudra Encyclopedia (`/library`)**:
   - 28 classical mudras with 3D hand models, verified Viniyogas (usages), and common formation errors.
4. **Structured 6-Level Curriculum**:
   - 13 progressive lessons spanning foundations, basic adavus, rhythm, and introductory Alarippu.
5. **Goonj Multilingual Voice Coaching**:
   - 14 Indian regional languages catalog with classical terminology preservation.
6. **On-Device Gesture Recognition (`/live`, `/practice`)**:
   - 100% private, client-side MediaPipe Tasks-Vision tracking. Zero video frames leave the browser.

---

## 7. Technology Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Three.js, Lucide React, Framer Motion.
- **Backend**: FastAPI (Python 3.10+), Edge-TTS / Goonj Neural Voice Engine, MediaPipe Tasks-Vision.
- **Testing**: Node.js built-in test runner (`--experimental-strip-types`), Python `unittest`.
- **Hosting**: Netlify Edge (Frontend), Render (Backend API).

---

## 8. Product Differentiation
| Dimension | Traditional Video / YouTube | Camera-Scoring Apps | NrityaVaani |
| :--- | :--- | :--- | :--- |
| **Primary Interaction** | Passive viewing | Stressful webcam scoring | Interactive 3D Guru instruction |
| **3D Spatial Awareness** | None (fixed 2D frame) | None (2D camera overlay) | Full 360° orbit, zoom, multi-viewpoints |
| **Pedagogical Structure** | Unstructured playlists | Fragmented mini-games | Structured 8-chapter Shastric curriculum |
| **Voice Narration** | Fixed audio track | Generic English sound effects | Multilingual neural voice in 14 languages |
| **Privacy** | N/A | Server-processed video frames | 100% client-side, zero video upload |
| **Cultural Provenance** | Varies widely | Often fabricated or unreferenced | Grounded in *Natya Shastra* & *Abhinaya Darpana* |
