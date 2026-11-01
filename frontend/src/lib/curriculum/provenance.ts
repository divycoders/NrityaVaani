/**
 * Content Provenance & Review Status Registry
 *
 * Provides transparent, lightweight metadata regarding the classical source texts,
 * pedagogical traditions, and validation status for each curriculum lesson.
 */

export type ValidationStatus = "source-supported" | "guru-review-required" | "in-production";

export type ClassicalTradition =
  | "General / Pan-Bharatanatyam"
  | "Kalakshetra Bani"
  | "Pandanallur / Tanjavur Bani"
  | "Abhinaya Darpana Canon"
  | "Natya Shastra Canon";

export interface ContentProvenance {
  lessonSlug: string;
  sourceText: string;
  sourceCitation?: string;
  validationStatus: ValidationStatus;
  statusLabel: string;
  tradition: ClassicalTradition;
  reviewer: string | null;
  notes: string;
  safetyAdvisory?: string;
}

export const CURRICULUM_PROVENANCE: Record<string, ContentProvenance> = {
  "intro-bharatanatyam": {
    lessonSlug: "intro-bharatanatyam",
    sourceText: "Bharata Muni's Natya Shastra (Ch. 1: Natyotpatti & Ch. 4: Tandavalaksana) & Nandikeshvara's Abhinaya Darpana (vv. 14–16)",
    sourceCitation: "Natya Shastra Ch. 1 & 4; Abhinaya Darpana vv. 14–16",
    validationStatus: "source-supported",
    statusLabel: "Source-Supported",
    tradition: "General / Pan-Bharatanatyam",
    reviewer: null,
    notes: "Core definitions of Nritta (pure dance), Nritya (expressive dance), and Natya (dramatic storytelling) follow classical Sanskrit treatises.",
  },
  "attire-and-environment": {
    lessonSlug: "attire-and-environment",
    sourceText: "Natya Shastra (Ch. 21: Aharyabhinaya) & Classical Gurukulam Oral Pedagogy",
    sourceCitation: "Natya Shastra Ch. 21",
    validationStatus: "source-supported",
    statusLabel: "Source-Supported",
    tradition: "General / Pan-Bharatanatyam",
    reviewer: null,
    notes: "Principles of Aharya (costume and adornment) and reverence for ankle bells (Salangai) follow traditional pedagogy.",
    safetyAdvisory: "Practice on shock-absorbent wooden or resilient dance floors; stamping on unyielding concrete can risk joint trauma.",
  },
  "samapada-and-aramandi": {
    lessonSlug: "samapada-and-aramandi",
    sourceText: "Abhinaya Darpana (Mandala Bheda: Ayata Mandala) & Natya Shastra (Ch. 10: Sthanas)",
    sourceCitation: "Abhinaya Darpana v. 261 (Ayata Mandala); Natya Shastra Ch. 10",
    validationStatus: "guru-review-required",
    statusLabel: "Guru Review Pending",
    tradition: "General / Pan-Bharatanatyam",
    reviewer: null,
    notes: "Postural geometry is defined in classical texts. Anatomical adaptation of turnout and heel spacing varies across traditions and human bodies.",
    safetyAdvisory: "Turnout must originate from hip rotation, not forced at the knees or ankles. Never force a 180° stance through pain.",
  },
  "basic-hand-positions": {
    lessonSlug: "basic-hand-positions",
    sourceText: "Natya Shastra (Ch. 9: Hastabhinaya & Ch. 10: Nritta Hastas) & Abhinaya Darpana",
    sourceCitation: "Natya Shastra Ch. 9 & 10",
    validationStatus: "source-supported",
    statusLabel: "Source-Supported",
    tradition: "General / Pan-Bharatanatyam",
    reviewer: null,
    notes: "Natyarambha and Kati Hastha geometry documented in classical treatises; arm angle and elevation nuances vary slightly across Banis.",
  },
  "namaskaram": {
    lessonSlug: "namaskaram",
    sourceText: "Repository Motion Capture Take (namaskaram.nvclip, 106.96s) & Traditional Academy Syllabus",
    sourceCitation: "frontend/public/lessons/namaskaram/manifest.json",
    validationStatus: "source-supported",
    statusLabel: "Source-Supported",
    tradition: "Kalakshetra Bani",
    reviewer: null,
    notes: "11-step pedagogical sequence with Guru Vandana shloka, synchronized audio, and verified 3D motion take.",
    safetyAdvisory: "Descend into and rise from Muzhumandi with controlled core engagement; avoid sudden knee drops.",
  },
  "thattadavu": {
    lessonSlug: "thattadavu",
    sourceText: "Repository Motion Capture Take (thattadavu.nvclip, 341.65s) & Adi Tala Adavu System",
    sourceCitation: "frontend/public/lessons/thattadavu/manifest.json",
    validationStatus: "source-supported",
    statusLabel: "Source-Supported",
    tradition: "General / Pan-Bharatanatyam",
    reviewer: null,
    notes: "8 progressive variations across three Kalams (speeds) in 8-beat Adi Tala, synchronized with sollukattu audio.",
    safetyAdvisory: "Maintain comfortable Aramandi height; do not bounce the torso or land heavily on heels during faster speeds.",
  },
  "natta-adavu": {
    lessonSlug: "natta-adavu",
    sourceText: "Classical Adavu Pedagogy (Natya Shastra & Abhinaya Darpana taxonomy)",
    sourceCitation: "Classical Adavu Taxonomy",
    validationStatus: "in-production",
    statusLabel: "Mocap In Production",
    tradition: "General / Pan-Bharatanatyam",
    reviewer: null,
    notes: "Step breakdowns and sollukattu are documented for theoretical study. 3D motion capture is scheduled for studio capture with Natyacharya review.",
    safetyAdvisory: "Keep supporting knee aligned over toes while extending the working leg on its heel.",
  },
  "adi-tala-and-rhythm": {
    lessonSlug: "adi-tala-and-rhythm",
    sourceText: "Carnatic Musicology: Suladi Sapta Tala System (Chaturashra Jaati Triputa Tala)",
    sourceCitation: "Standard Carnatic Tala System",
    validationStatus: "source-supported",
    statusLabel: "Source-Supported",
    tradition: "General / Pan-Bharatanatyam",
    reviewer: null,
    notes: "The 8-beat structure (1 Laghu of 4 counts + 2 Dhrutams of 2 counts) and Kalam tempo doubling ratios are source-supported.",
  },
  "sollukattu-art": {
    lessonSlug: "sollukattu-art",
    sourceText: "Carnatic Percussion Pedagogy & Oral Nattuvangam Tradition",
    sourceCitation: "Oral Nattuvangam Tradition",
    validationStatus: "source-supported",
    statusLabel: "Source-Supported",
    tradition: "General / Pan-Bharatanatyam",
    reviewer: null,
    notes: "Onomatopoeic dance syllables (bols) and Nattuvangam cadence represent authentic oral lineage practice.",
  },
  "asamyukta-hastas": {
    lessonSlug: "asamyukta-hastas",
    sourceText: "Nandikeshvara's Abhinaya Darpana (vv. 89–92: Asamyukta Hastas) & NrityaVaani Hand Model Rig",
    sourceCitation: "Abhinaya Darpana vv. 89–92; Mudra Dataset (Dr. Sunil T.T. / Jisha Raj R)",
    validationStatus: "source-supported",
    statusLabel: "Source-Supported",
    tradition: "Abhinaya Darpana Canon",
    reviewer: "Dr. Sunil T.T. / Jisha Raj R (Research dataset reference)",
    notes: "Classical tradition details 28 Asamyukta Hastas in the Abhinaya Darpana. The platform currently models 18 of these in the digital library, with 8 baked 3D joint poses.",
  },
  "samyukta-hastas": {
    lessonSlug: "samyukta-hastas",
    sourceText: "Nandikeshvara's Abhinaya Darpana (vv. 176–179: Samyukta Hastas) & NrityaVaani Hand Library",
    sourceCitation: "Abhinaya Darpana vv. 176–179; Mudra Dataset (Dr. Sunil T.T. / Jisha Raj R)",
    validationStatus: "source-supported",
    statusLabel: "Source-Supported",
    tradition: "Abhinaya Darpana Canon",
    reviewer: "Dr. Sunil T.T. / Jisha Raj R (Research dataset reference)",
    notes: "Classical tradition details 24 Samyukta Hastas in the Abhinaya Darpana. The platform currently features 10 combined gestures in its interactive library.",
  },
  "daily-revision-routine": {
    lessonSlug: "daily-revision-routine",
    sourceText: "Contemporary Dance Pedagogy & Patanjali's Yoga Sutras (Abhyasa Principle, Sutra 1.14)",
    sourceCitation: "Yoga Sutra 1.14 (Abhyasa); Academy Training Models",
    validationStatus: "guru-review-required",
    statusLabel: "Guru Review Pending",
    tradition: "General / Pan-Bharatanatyam",
    reviewer: null,
    notes: "The 30-minute breakdown is an optional, suggested practice template; intensity and duration must be customized to individual stamina.",
    safetyAdvisory: "Practice duration should be calibrated to individual stamina. Never skip warm-up; never dance through sharp joint pain or severe fatigue.",
  },
  "curriculum-assessment-guide": {
    lessonSlug: "curriculum-assessment-guide",
    sourceText: "Natya Shastra (Ch. 4: Anga Shuddhi Principles) & Reflective Practice Frameworks",
    sourceCitation: "Natya Shastra Ch. 4",
    validationStatus: "guru-review-required",
    statusLabel: "Guru Review Pending",
    tradition: "General / Pan-Bharatanatyam",
    reviewer: null,
    notes: "Self-assessment rubric assists with personal reflection on form clarity; does not replace periodic evaluation by a qualified Guru.",
  },
};

/**
 * Returns provenance information for a given lesson slug.
 */
export function getLessonProvenance(slug: string): ContentProvenance | undefined {
  return CURRICULUM_PROVENANCE[slug];
}
