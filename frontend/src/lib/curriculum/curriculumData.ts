import { getLessonProvenance, type ContentProvenance } from "./provenance.ts";

/**
 * Verified Bharatanatyam Curriculum Data.
 *
 * Organized into six progressive levels following traditional Natya Shastra
 * and Abhinaya Darpana pedagogy, with explicit documentation of Bani (tradition)
 * nuances and honest identification of assets requiring Natyacharya mocap sessions.
 */

export interface CurriculumConcept {
  title: string;
  explanation: string;
}

export interface CommonMistake {
  mistake: string;
  correction: string;
}

export interface SollukattuEntry {
  syllables: string;
  rhythm: string;
  meaning: string;
}

export interface CurriculumLesson {
  id: string;
  slug: string;
  level: number;
  levelName: string;
  title: string;
  subtitle: string;
  description: string;
  durationMinutes: number;
  prerequisites: { slug: string; title: string }[];
  type: "interactive-3d-motion" | "guided-posture-concept" | "rhythm-tala" | "mudra-viniyoga" | "revision";
  status: "available" | "verified-concept" | "mocap-pending";
  hasMotionClip: boolean;
  objectives: string[];
  keyConcepts: CurriculumConcept[];
  guruNote: string;
  techniqueCues: string[];
  sollukattu?: SollukattuEntry[];
  commonMistakes: CommonMistake[];
  traditionNotes?: string;
  needsGuruReview: boolean;
  guruReviewNote?: string;
  safetyAdvisory?: string;
  provenance?: ContentProvenance;
  nextLessonSlug?: string;
}

export const CURRICULUM_LEVELS = [
  {
    level: 1,
    title: "Level 1: Introduction",
    tagline: "Spiritual roots, context, and sacred environment",
    description: "Understand the origin of Bharatanatyam from the Natya Shastra, the Guru-Shishya tradition, and the sacred preparation required for practice.",
  },
  {
    level: 2,
    title: "Level 2: Foundations",
    tagline: "Sacred stances, spinal balance, and arm extension",
    description: "Master the fundamental anatomical postures of classical dance: Samapada, Aramandi (Ayata Mandala), and Natyarambha arm framing.",
  },
  {
    level: 3,
    title: "Level 3: Foundational Movements",
    tagline: "Sequential 3D adavus with the Virtual Guru",
    description: "Learn foundational sequences frame-by-frame with 3D motion playback: Namaskaram (Bhumi Pranam) and the eight Thattadavu footwork patterns.",
  },
  {
    level: 4,
    title: "Level 4: Rhythm & Coordination",
    tagline: "Adi Tala metrics, sollukattu, and three speeds",
    description: "Internalize Carnatic rhythm through the 8-beat Adi Tala metric cycle, recitation of sollukattu syllables, and speed transitions (Kalams).",
  },
  {
    level: 5,
    title: "Level 5: Mudra Knowledge",
    tagline: "Asamyukta and Samyukta Hasta Viniyoga",
    description: "Study the foundational single-hand (Asamyukta) and combined-hand (Samyukta) classical gestures documented in the Abhinaya Darpana (28 single, 24 double in tradition; 18 and 10 interactive in the library) with 3D models and traditional poetic meanings.",
  },
  {
    level: 6,
    title: "Level 6: Revision & Continuity",
    tagline: "Daily sadhana routines and self-assessment",
    description: "Establish a disciplined personal practice routine, review completed movements, and systematically track postural strength over time.",
  },
] as const;

export const BHARATANATYAM_CURRICULUM: CurriculumLesson[] = [
  // ================= LEVEL 1: INTRODUCTION =================
  {
    id: "1-1",
    slug: "intro-bharatanatyam",
    level: 1,
    levelName: "Level 1: Introduction",
    title: "Introduction to Bharatanatyam: Spiritual Roots & Natya Shastra",
    subtitle: "The temple tradition, divine lineage, and three core elements: Nritta, Nritya, Natya",
    description:
      "Bharatanatyam is one of the oldest classical dance traditions of India, originating in the sacred temples of Tamil Nadu. Sculpted across Chola temple gopurams and codified in Bharata Muni's Natya Shastra, it merges sacred geometry, rhythmic precision, and emotive storytelling. This lesson introduces the fundamental philosophy of Indian classical dance and the three pillars: Nritta (pure rhythmic movement), Nritya (interpretative movement with facial expression), and Natya (dramatic theatrical narrative).",
    durationMinutes: 8,
    prerequisites: [],
    type: "guided-posture-concept",
    status: "verified-concept",
    hasMotionClip: false,
    objectives: [
      "Understand the historical roots and temple origins of Bharatanatyam.",
      "Distinguish between the three core elements: Nritta, Nritya, and Natya.",
      "Learn the reverence of Guru-Shishya Parampara (lineage transmission).",
      "Prepare your mental state and focus for classical dance sadhana.",
    ],
    keyConcepts: [
      {
        title: "Nritta (नृत्त)",
        explanation: "Pure aesthetic dance devoid of mood or emotional narrative. Focuses purely on bodily geometry, rhythmic footwork, and precise hand mudras.",
      },
      {
        title: "Nritya (नृत्य)",
        explanation: "Expressive dance that communicates a theme or rasa through facial abhinaya, stylized eye movements, and hasta mudras.",
      },
      {
        title: "Natya (नाट्य)",
        explanation: "The dramatic component incorporating characters, theatrical speech, dialogue, and mythological storytelling.",
      },
    ],
    guruNote:
      "Classical dance is treated not merely as physical performance, but as sadhana — spiritual discipline. Approach every session with an uncluttered mind and devotion to the craft.",
    techniqueCues: [
      "Maintain respectful stillness while listening to shlokas and instructions.",
      "Keep the spine naturally lengthened without arching the lower back.",
      "Acknowledge the space and floor as sacred prior to stepping into dance.",
    ],
    commonMistakes: [
      {
        mistake: "Treating Bharatanatyam solely as athletic exercise without internalizing the cultural and poetic context.",
        correction: "Contemplate the meaning of each mudra and the reverence embedded in the opening shloka.",
      },
    ],
    traditionNotes:
      "While contemporary institutions teach structured staged repertoires (Margam), ancient temple traditions (Sadir Natyam) focused on temple rituals and devotional offerings.",
    needsGuruReview: false,
    nextLessonSlug: "attire-and-environment",
  },
  {
    id: "1-2",
    slug: "attire-and-environment",
    level: 1,
    levelName: "Level 1: Introduction",
    title: "Sacred Space & Attire: Aharya Abhinaya, Ghungroos & Alta",
    subtitle: "Preparing your body and training environment for regular practice",
    description:
      "Aharya Abhinaya represents expression through costume, adornment, and sacred physical preparation. Before dancing, the student must prepare both their environment (a clean, level wooden or smooth floor free of hazards) and their personal attire (breathable cotton practice saree or kurta-salwar, tied bells, and alta dye). Understanding how costume affects posture and weight distribution is vital for safe practice.",
    durationMinutes: 6,
    prerequisites: [{ slug: "intro-bharatanatyam", title: "Introduction to Bharatanatyam" }],
    type: "guided-posture-concept",
    status: "verified-concept",
    hasMotionClip: false,
    objectives: [
      "Identify the components of classical practice attire and Aharya Abhinaya.",
      "Understand the acoustic and rhythmic function of Salangai / Ghungroos (ankle bells).",
      "Learn how to select a safe floor surface that protects knees and ankle joints.",
      "Practice tying and securing ankle bells with even tension.",
    ],
    keyConcepts: [
      {
        title: "Salangai / Ghungroo (சலங்கை)",
        explanation: "Strings of bronze bells worn around the ankles. In traditional pedagogy, bells are not worn by beginners until the teacher verifies rhythmic consistency.",
      },
      {
        title: "Floor Surface Requirements",
        explanation: "Dance only on wooden floors or smooth stone with slight give. Stamping hard on bare concrete without shock absorption can cause knee and shin trauma.",
      },
    ],
    guruNote:
      "Treat your Salangai with utmost reverence. Never leave ankle bells on the floor where they might be stepped over; touch them to your eyes and forehead before tying.",
    techniqueCues: [
      "Tie bells securely over a protective cloth band to avoid bruising the Achilles tendon.",
      "Ensure practice attire allows full knee flexion in Aramandi without restricting pelvic alignment.",
    ],
    commonMistakes: [
      {
        mistake: "Dancing on slippery tiles or hard, unyielding concrete surfaces.",
        correction: "Practice on wooden surfaces, a dance mat, or smooth non-slip floors with good joint support.",
      },
    ],
    traditionNotes:
      "Kalakshetra introduced the standardized cotton practice saree with pleated borders for students, now embraced worldwide.",
    needsGuruReview: false,
    nextLessonSlug: "samapada-and-aramandi",
  },

  // ================= LEVEL 2: FOUNDATIONS =================
  {
    id: "2-1",
    slug: "samapada-and-aramandi",
    level: 2,
    levelName: "Level 2: Foundations",
    title: "Foundational Stances: Samapada, Aramandi & Muzhumandi",
    subtitle: "The geometric center of Bharatanatyam: upright alignment and the demi-plié half-sit",
    description:
      "Every movement in Bharatanatyam originates from and returns to precise geometric postures. Samapada is the upright stance with parallel feet and lengthened spine. Aramandi (also termed Ayata Mandala) is the definitive half-sitting posture where knees open wide in a lateral diamond shape while the torso remains perfectly upright. Muzhumandi represents the complete sit on the balls of the feet with heels touching. Turnout must originate from the natural external rotation of the hip sockets rather than forcing feet outward at the knees or ankles.",
    durationMinutes: 12,
    prerequisites: [{ slug: "attire-and-environment", title: "Sacred Space & Attire" }],
    type: "guided-posture-concept",
    status: "verified-concept",
    hasMotionClip: false,
    objectives: [
      "Demonstrate correct foot placement in Samapada with even weight distribution.",
      "Achieve stable Aramandi posture with knees aligned over turned-out toes.",
      "Maintain a vertical lumbar spine and engaged core without tilting the pelvis.",
      "Transition smoothly between Samapada, Aramandi, and Muzhumandi.",
    ],
    keyConcepts: [
      {
        title: "Samapada (समपाद)",
        explanation: "Standing upright with feet together, weight centered over the midfoot, crown of the head reaching towards the sky.",
      },
      {
        title: "Aramandi / Ayata (அரைமண்டி)",
        explanation: "The foundational demi-plié: feet turned out at approximately 180° in a flat line, knees flexed outward sideways forming a diamond silhouette.",
      },
      {
        title: "Muzhumandi (முழுமண்டி)",
        explanation: "The full squat position where hips sink fully down between the calves while maintaining an upright spine and wide knees.",
      },
    ],
    guruNote:
      "Aramandi is the breath and backbone of Bharatanatyam. Do not compromise depth to cheat balance. If your knees collapse inward, you risk injury; build hip external rotator strength gradually.",
    techniqueCues: [
      "Keep chest lifted and shoulders relaxed away from the ears.",
      "Tuck tailbone slightly downwards to prevent hyper-lordosis (excessive arching) in the lower spine.",
      "Knees must track in the exact same direction as the second toe.",
    ],
    commonMistakes: [
      {
        mistake: "Allowing knees to cave inward towards each other instead of pressing back.",
        correction: "Actively engage external hip rotators to push knees outward over the toes.",
      },
      {
        mistake: "Leaning the torso forward from the hips to compensate for lack of knee bend.",
        correction: "Imagine an invisible wall behind your back; slide down the wall while keeping your spine vertical.",
      },
    ],
    traditionNotes:
      "The exact spacing between heels in Aramandi varies across authentic traditions: Kalakshetra typically teaches approximately two to three fingers' width between heels with geometric precision, whereas Pandanallur and older Tanjavur styles often position heels closer or touching, allowing a slightly more natural stance aligned with individual pelvis width. Both lineages are classical; dancers should follow their lineage teacher's guidance.",
    safetyAdvisory:
      "Turnout must originate from hip rotation, not forced at the knees or ankles. Never force a 180° stance through pain.",
    needsGuruReview: false,
    nextLessonSlug: "basic-hand-positions",
  },
  {
    id: "2-2",
    slug: "basic-hand-positions",
    level: 2,
    levelName: "Level 2: Foundations",
    title: "Natyarambha & Basic Hastas: Arm Extension and Chest Alignment",
    subtitle: "Framing the torso: wide elbow carriage, Katakamukha, and Pataka placements",
    description:
      "Natyarambha is the expansive lateral arm placement that frames the dancer's body. Arms extend horizontally from the shoulders with elbows lifted and curved gently forward, never drooping downward or locked rigid. This lesson guides you through holding Natyarambha, positioning hands in Katakamukha and Pataka, and maintaining open chest resonance while holding steady rhythm.",
    durationMinutes: 10,
    prerequisites: [{ slug: "samapada-and-aramandi", title: "Foundational Stances" }],
    type: "guided-posture-concept",
    status: "verified-concept",
    hasMotionClip: false,
    objectives: [
      "Hold correct Natyarambha arm framing without lifting or tensing the shoulder girdle.",
      "Position elbows high and rounded in line with the mid-chest.",
      "Understand the relationship between arm extension and peripheral eye gaze.",
      "Coordinate hand placement on the waist (Kati Hastha) for adavu footwork.",
    ],
    keyConcepts: [
      {
        title: "Natyarambha (नाट्यारम्भ)",
        explanation: "The fundamental arm extension framing the torso horizontally, creating space for expressive hand gestures and broad scenic presence.",
      },
      {
        title: "Kati Hastha (கடிஹஸ்தம்)",
        explanation: "Hands placed firmly behind the waist with thumbs forward or palms flat against the posterior hip bones, used during pure footwork drills.",
      },
    ],
    guruNote:
      "When holding Natyarambha, the hands should not droop below elbow level. Imagine holding a broad garland of flowers across your chest.",
    techniqueCues: [
      "Broaden your collarbones and pull shoulder blades gently down your back.",
      "Keep wrists energized without breaking the line of the forearm.",
    ],
    commonMistakes: [
      {
        mistake: "Elbows drooping downwards toward the ribs, breaking the horizontal architectural frame.",
        correction: "Lift the elbows from underneath, keeping them elevated at mid-chest level.",
      },
    ],
    traditionNotes:
      "Some schools position Katakamukha hands closer to the sternum; the Natya Shastra emphasizes keeping gestures two vitastis (approximately 18 inches) clear of the body.",
    needsGuruReview: false,
    nextLessonSlug: "namaskaram",
  },

  // ================= LEVEL 3: FOUNDATIONAL MOVEMENTS =================
  {
    id: "3-1",
    slug: "namaskaram",
    level: 3,
    levelName: "Level 3: Foundational Movements",
    title: "Part 1: Namaskaram (Bhumi Pranam)",
    subtitle: "The sacred salutation danced before and after every practice session",
    description:
      "Namaskaram (Bhumi Pranam) is the sacred prayer danced by every student and master before entering and leaving the dance space. Through 11 sequential steps, the dancer recites the Guru Vandana shloka, settles into Aramandi, executes rhythmic foot taps, sinks into Muzhumandi to seek forgiveness and blessings from Mother Earth (Bhumi Devi), and offers reverence to God (Paramatma), the Guru, and the assembly (Sabha). This is an interactive 3D motion lesson with frame-by-frame controls and bilingual voice guidance.",
    durationMinutes: 15,
    prerequisites: [
      { slug: "samapada-and-aramandi", title: "Foundational Stances" },
      { slug: "basic-hand-positions", title: "Natyarambha & Basic Hastas" },
    ],
    type: "interactive-3d-motion",
    status: "available",
    hasMotionClip: true,
    objectives: [
      "Perform all 11 steps of Namaskaram in accurate sequence and timing.",
      "Recite and understand the opening Guru Vandana Sanskrit shloka.",
      "Execute the transition into Muzhumandi while keeping heels aligned.",
      "Understand the symbolic meaning of touching Mother Earth and bringing blessings to the eyes.",
    ],
    keyConcepts: [
      {
        title: "Guru Vandana (गुरु वन्दना)",
        explanation: "Shloka honoring the teacher: 'Guru Brahma, Guru Vishnu, Guru Devo Maheshwaraha...'.",
      },
      {
        title: "Disha Vandana (दिशा वन्दना)",
        explanation: "Sweeping salutation across cardinal directions, acknowledging all living beings.",
      },
      {
        title: "Bhumi Pranam (भूमि प्रणाम)",
        explanation: "Asking Mother Earth's forgiveness for stamping upon her body during the dance.",
      },
    ],
    guruNote:
      "Never rush through Namaskaram. It sets your spiritual intent and anchors your breathing. Each step must be reverent, centered, and precise.",
    techniqueCues: [
      "In Guru Vandana, press palms in Anjali Mudra directly against the sternum.",
      "Jump softly with both feet landing simultaneously into grounded Aramandi.",
      "Rise slowly from Muzhumandi without lurching forward or pressing palms against the knees.",
    ],
    commonMistakes: [
      {
        mistake: "Rushing out of the full sit (Muzhumandi) due to quadriceps fatigue.",
        correction: "Rise smoothly and gradually using abdominal core strength and even heel pressure.",
      },
      {
        mistake: "Placing hands behind the body or off-center when touching the ground.",
        correction: "Place flat palms symmetrically on the earth directly in front of the knees.",
      },
    ],
    traditionNotes:
      "Some Banis perform two jumps during Namaskaram; our recorded sequence follows the standardized 11-step pedagogical sequence common to Kalakshetra and central academies.",
    needsGuruReview: false,
    nextLessonSlug: "thattadavu",
  },
  {
    id: "3-2",
    slug: "thattadavu",
    level: 3,
    levelName: "Level 3: Foundational Movements",
    title: "Part 2: Thattadavu (The 8 Striking Steps)",
    subtitle: "Rhythmic footwork in Aramandi: flat stamping across three speeds (Kalams)",
    description:
      "Thattadavu is the very first family of adavus taught in Bharatanatyam. Derived from the root word 'Tattu' (meaning to strike with the flat sole), it focuses entirely on footwork, spinal stability, and metric precision while the hands rest quietly on the waist (Kati Hastha). The student learns 8 progressive variations starting from single alternate taps up to intricate syncopated strike groups, danced across Prathama (1st), Dvitiya (2nd), and Tritiya (3rd) speeds.",
    durationMinutes: 25,
    prerequisites: [{ slug: "namaskaram", title: "Part 1: Namaskaram" }],
    type: "interactive-3d-motion",
    status: "available",
    hasMotionClip: true,
    objectives: [
      "Execute all 8 Thattadavu variations with crisp, flat-footed strikes.",
      "Maintain deep, unwavering Aramandi height without rising between beats.",
      "Chant rhythmic sollukattu syllables ('Tai Ya Tai Hi') in sync with foot strikes.",
      "Transition accurately between 1st, 2nd, and 3rd speeds (Kalams).",
    ],
    keyConcepts: [
      {
        title: "Tattu (தட்டு)",
        explanation: "To strike the floor with the entire flat sole of the foot, producing a sharp, resonant acoustic beat.",
      },
      {
        title: "Kalam (காலம்)",
        explanation: "The three standard metric tempos: Prathama (slow/base speed), Dvitiya (double speed), and Tritiya (quadruple speed).",
      },
      {
        title: "Adi Tala Metric Alignment",
        explanation: "Each adavu cycle fits strictly into the 8-beat structure of Adi Tala.",
      },
    ],
    guruNote:
      "Strike with the whole sole of the foot, never with just the toes or heel. The strike must be decisive, like striking a drum (Mridangam), while your upper body remains motionless.",
    techniqueCues: [
      "Keep hands firmly anchored behind the waist with elbows pressed back.",
      "Always start every adavu cycle on the right foot first.",
      "Do not bob your head or bounce your shoulders when striking.",
    ],
    sollukattu: [
      { syllables: "Tai Ya Tai Hi", rhythm: "Slow 1-2, 3-4", meaning: "Adavu 1 single strike syllables" },
      { syllables: "Tai Tai Dhit Dit Tai", rhythm: "Double strike 1-2, 1-2", meaning: "Adavu 2 rhythm" },
    ],
    commonMistakes: [
      {
        mistake: "Rising up out of Aramandi during 2nd and 3rd speeds as fatigue sets in.",
        correction: "Lock your hip height from the first beat; speed comes from ankle flexion, not body bounce.",
      },
      {
        mistake: "Striking only on the ball of the foot or slapping the toes.",
        correction: "Lift the entire foot cleanly and bring the full sole down parallel to the floor.",
      },
    ],
    traditionNotes:
      "Varying traditions number thattadavus slightly differently (e.g. 8 vs 10 sub-patterns). Our take covers the classic 8-adavu syllabus in Adi Tala.",
    needsGuruReview: false,
    nextLessonSlug: "natta-adavu",
  },
  {
    id: "3-3",
    slug: "natta-adavu",
    level: 3,
    levelName: "Level 3: Foundational Movements",
    title: "Part 3: Natta Adavu (Heel & Stretch Adavu)",
    subtitle: "Extending the legs, planting the heel, and coordinating Tripataka arm sweeps",
    description:
      "Natta Adavu is the second major adavu family, derived from 'Nattu' (to plant or settle firmly). Unlike the flat strikes of Thattadavu, Natta Adavu introduces heel touches (Kutti Thattu), leg extensions, and sweeping Tripataka hand movements that coordinate body lateral flexion with foot placement. This lesson outlines the core technique and theoretical breakdown while studio 3D motion capture is undergoing expert Natyacharya review.",
    durationMinutes: 20,
    prerequisites: [{ slug: "thattadavu", title: "Part 2: Thattadavu" }],
    type: "guided-posture-concept",
    status: "mocap-pending",
    hasMotionClip: false,
    objectives: [
      "Understand the mechanics of planting the heel (Nattu) with toes flexed upwards.",
      "Coordinate horizontal Tripataka arm extensions with alternating leg lunges.",
      "Master the sollukattu: 'Tai Yum Tat Tat, Tai Yum Tam'.",
      "Learn how Natta Adavu prepares the dancer for broad stage traversal.",
    ],
    keyConcepts: [
      {
        title: "Nattu (நாட்டு)",
        explanation: "To plant the heel firmly into the ground with toes pointed towards the ceiling, followed by a flat-foot strike.",
      },
      {
        title: "Tripataka Arm Reach",
        explanation: "Sweeping arms from Katakamukha at the chest out to broad lateral Tripataka, tracking with eye gaze.",
      },
    ],
    guruNote:
      "Ensure your heel touches the ground directly in line with your hip diagonal, not behind your body. Keep the supporting knee bent deep in Aramandi.",
    techniqueCues: [
      "Keep supporting foot flat while extending working leg.",
      "Head and eyes must follow the moving hand gesture (Drishti Bheda).",
    ],
    commonMistakes: [
      {
        mistake: "Allowing the supporting knee to straighten when extending the working leg.",
        correction: "Maintain deep Aramandi in the supporting leg to preserve balance and line.",
      },
    ],
    traditionNotes:
      "Pandanallur Bani uses slightly deeper lunges and sweeping arches, whereas Kalakshetra focuses on crisp 90° angular arm placements.",
    needsGuruReview: true,
    guruReviewNote:
      "3D Mocap take currently scheduled for studio recording with Natyacharya verification. Theory and step mechanics verified from Natya Shastra and Abhinaya Darpana texts.",
    nextLessonSlug: "adi-tala-and-rhythm",
  },

  // ================= LEVEL 4: RHYTHM & COORDINATION =================
  {
    id: "4-1",
    slug: "adi-tala-and-rhythm",
    level: 4,
    levelName: "Level 4: Rhythm & Coordination",
    title: "Understanding Adi Tala: The 8-Beat Metric Cycle & 3 Speeds (Kalams)",
    subtitle: "Clapping, finger counting (Kriyas), and internalizing tempo progression",
    description:
      "Tala is the heartbeat of Indian classical music and dance. Adi Tala is the most ubiquitous metric cycle in Carnatic music, consisting of 8 aksharas (beats) divided into a 4-beat Laghu (clap and 3 finger counts) and two 2-beat Dhrutams (clap and wave). Understanding how to count Adi Tala with your hands while dancing with your feet is essential for rhythmic independence and tempo stability.",
    durationMinutes: 15,
    prerequisites: [{ slug: "thattadavu", title: "Part 2: Thattadavu" }],
    type: "rhythm-tala",
    status: "verified-concept",
    hasMotionClip: false,
    objectives: [
      "Count and clap Adi Tala correctly: 1 clap + 3 finger counts + 1 clap + 1 wave + 1 clap + 1 wave.",
      "Distinguish between the 3 speeds (Kalams) and maintain proportional acceleration.",
      "Coordinate vocal sollukattu recitation with manual tala clapping.",
      "Recognize the Samam (first beat) of the rhythmic cycle.",
    ],
    keyConcepts: [
      {
        title: "Laghu (लघु - 4 counts)",
        explanation: "1 palm strike on the thigh followed by counting little finger, ring finger, and middle finger (1, 2, 3, 4).",
      },
      {
        title: "Dhrutam (द्रुतम् - 2 counts)",
        explanation: "1 palm strike followed by 1 upward wave/turn of the hand (Usi). Adi Tala has two Dhrutams (5, 6 and 7, 8).",
      },
      {
        title: "Kalams (Speeds)",
        explanation: "1st Speed (Prathama Kalam: 1 note per beat), 2nd Speed (Dvitiya Kalam: 2 notes per beat), 3rd Speed (Tritiya Kalam: 4 notes per beat).",
      },
    ],
    guruNote:
      "Never rush when speeding up from 1st to 2nd speed. The tempo must exactly double (2:1 ratio) without stumbling or dragging.",
    techniqueCues: [
      "Keep finger taps crisp and silent against the thigh.",
      "Clap firmly without cupping hands or producing dull muffled slaps.",
    ],
    commonMistakes: [
      {
        mistake: "Speeding up gradually like an accelerating train instead of jumping into strict mathematical double tempo.",
        correction: "Practice with a metronome or Mridangam track to maintain exact 2x and 4x tempo intervals.",
      },
    ],
    traditionNotes:
      "Adi Tala is technically the Chaturashra Jaati Triputa Tala in the classical Suladi Sapta Tala system.",
    needsGuruReview: false,
    nextLessonSlug: "sollukattu-art",
  },
  {
    id: "4-2",
    slug: "sollukattu-art",
    level: 4,
    levelName: "Level 4: Rhythm & Coordination",
    title: "The Language of Sollukattu: Syllables, Bols, and Nattuvangam",
    subtitle: "Chanting syllables, cymbals (Thalam), and vocalizing footwork commands",
    description:
      "Sollukattu (from Tamil 'Sol' = word, 'Kattu' = structure) is the spoken rhythmic language of Bharatanatyam. Every foot strike and arm flourish corresponds to specific onomatopoeic syllables chanted by the teacher or Nattuvanar using bronze cymbals. This lesson teaches you how to pronounce and vocalize common rhythmic bols with crisp articulation, diaphragmatic support, and steady cadence.",
    durationMinutes: 12,
    prerequisites: [{ slug: "adi-tala-and-rhythm", title: "Understanding Adi Tala" }],
    type: "rhythm-tala",
    status: "verified-concept",
    hasMotionClip: false,
    objectives: [
      "Pronounce foundational sollukattu syllables: 'Tai', 'Dhit', 'Tom', 'Nam', 'Kitataka'.",
      "Learn how Nattuvangam cymbals guide the dancer's footwork and phrasing.",
      "Chant rhythmic phrases while maintaining steady finger-count tala.",
      "Recognize Aradhi and Teermanam concluding rhythmic phrases.",
    ],
    keyConcepts: [
      {
        title: "Sollukattu Syllables",
        explanation: "Vocalized rhythmic syllables that mirror Mridangam strokes and provide temporal anchors for the dancer.",
      },
      {
        title: "Nattuvangam (நட்டுவாங்கம்)",
        explanation: "The art of reciting rhythmic syllables while striking brass/iron cymbals to conduct the dance performance.",
      },
      {
        title: "Teermanam (தீர்மானம்)",
        explanation: "A concluding rhythmic flourish repeated three times, marking the end of a movement sequence or jathi.",
      },
    ],
    guruNote:
      "The voice must be energetic and clear from the solar plexus. Slurred syllables lead to lazy footwork.",
    techniqueCues: [
      "Articulate consonants sharply ('Ta', 'Dhi', 'Gi', 'Na', 'Thom').",
      "Breathe rhythmically during natural pauses in the metric cycle.",
    ],
    commonMistakes: [
      {
        mistake: "Mumbling syllables or losing synchrony between tongue and foot strike.",
        correction: "Practice chanting out loud at half speed before coordinating with adavu steps.",
      },
    ],
    traditionNotes:
      "Different Banis use slight variations in syllable coloring (e.g. 'Tat-Dhit-Tom-Nam' vs 'Tai-Tai-Dhit-Dit-Tai'). Both are rhythmically equivalent.",
    needsGuruReview: false,
    nextLessonSlug: "asamyukta-hastas",
  },

  // ================= LEVEL 5: MUDRA KNOWLEDGE =================
  {
    id: "5-1",
    slug: "asamyukta-hastas",
    level: 5,
    levelName: "Level 5: Mudra Knowledge",
    title: "Single-Hand Gestures (Asamyukta Hastas): Canon & Viniyoga",
    subtitle: "Abhinaya Darpana single-hand vocabulary (28 in tradition; 18 interactive in library)",
    description:
      "According to Nandikeshvara's Abhinaya Darpana, there are 28 canonical single-hand gestures (Asamyukta Hastas). In this module, explore the full classical sequence and interact directly with the 18 single-hand mudras currently modeled in NrityaVaani's library (with 8 baked 3D poses). Understand finger extension angles, traditional meanings, and symbolic applications (viniyoga) without assuming all gestures are immediately available in 3D.",
    durationMinutes: 30,
    prerequisites: [{ slug: "basic-hand-positions", title: "Natyarambha & Basic Hastas" }],
    type: "mudra-viniyoga",
    status: "available",
    hasMotionClip: false,
    objectives: [
      "Memorize and recite the 28 Asamyukta Hastas in Sanskrit shloka order.",
      "Form each mudra with correct joint flexion, thumb placement, and finger spacing.",
      "Understand the primary viniyoga (symbolic applications) for each gesture.",
      "Identify common alignment errors using the 3D hand visualizer.",
    ],
    keyConcepts: [
      {
        title: "Asamyukta Hasta (असंयुक्त हस्त)",
        explanation: "Gestures formed by one hand operating independently. 28 gestures codified in the Abhinaya Darpana.",
      },
      {
        title: "Viniyoga (विनियोग)",
        explanation: "The sanctioned poetic usages: e.g. Pataka is used for clouds, a forest, cutting things, or opening a door.",
      },
      {
        title: "Hasta Prana (हस्त प्राण)",
        explanation: "The life/energy of the hand: fingertips must remain energized, never limp or lifeless.",
      },
    ],
    guruNote:
      "A mudra is not a static mannequin pose; it is alive with intent. Even when holding Pataka, the palm radiates life from the center outward.",
    techniqueCues: [
      "Keep fingers pressed firmly together in Pataka; gaps break the aesthetic line.",
      "In Tripataka, bend only the ring finger at the middle phalanx without curling the other fingers.",
      "In Mayura, touch the tip of the ring finger lightly to the thumb tip while keeping the other three fingers straight and separated.",
    ],
    commonMistakes: [
      {
        mistake: "Allowing fingers to droop or curve backwards in hyper-extension.",
        correction: "Maintain straight, firm fingers with gentle muscular tonus.",
      },
    ],
    traditionNotes:
      "The Natya Shastra documents 24 Asamyukta Hastas, while the Abhinaya Darpana documents 28 (including Tamrachuda, Trishula, etc.). Our curriculum follows the widely practiced 28-hasta Abhinaya Darpana canon.",
    needsGuruReview: false,
    nextLessonSlug: "samyukta-hastas",
  },
  {
    id: "5-2",
    slug: "samyukta-hastas",
    level: 5,
    levelName: "Level 5: Mudra Knowledge",
    title: "Combined-Hand Gestures (Samyukta Hastas): Iconography & Viniyoga",
    subtitle: "Dual-hand formations (24 in tradition; 10 interactive in library)",
    description:
      "When both hands unite, they form Samyukta Hastas (combined gestures). The classical Abhinaya Darpana records 24 dual-hand gestures representing deities, relationships, sacred offerings, and natural elements. This module introduces the traditional 24-hasta canon and explores the 10 combined gestures currently modeled in NrityaVaani's digital library.",
    durationMinutes: 20,
    prerequisites: [{ slug: "asamyukta-hastas", title: "Single-Hand Gestures (Asamyukta Hastas)" }],
    type: "mudra-viniyoga",
    status: "verified-concept",
    hasMotionClip: false,
    objectives: [
      "Form primary Samyukta Hastas: Anjali, Kapota, Karkata, Swastika, Dola, and Pushpaputa.",
      "Understand the difference in palm spacing between Anjali (flat) and Kapota (cupped).",
      "Learn how combined hands depict deities such as Vishnu (Shankha & Chakra) and Shiva.",
      "Coordinate dual-hand gestures with eye direction (Drishti Bheda).",
    ],
    keyConcepts: [
      {
        title: "Anjali (अञ्जलि)",
        explanation: "Two Pataka hands joined palm-to-palm: placed above the head for the Divine, before the forehead for the Guru, at the chest for peers/audience.",
      },
      {
        title: "Pushpaputa (पुष्पपुट)",
        explanation: "Two Sarpashirsha hands placed together side-by-side to create a bowl for holding and scattering flowers at the deity's feet.",
      },
    ],
    guruNote:
      "Dual-hand mudras require symmetrical discipline. Neither hand should lag behind or hold a different altitude unless choreographically intended.",
    techniqueCues: [
      "Ensure palms touch evenly in Anjali with thumbs pressed flat against the palm edge.",
      "In Pushpaputa, keep the outer edges of the little fingers touching without creating holes where 'flowers would fall through'.",
    ],
    commonMistakes: [
      {
        mistake: "Letting one elbow sag lower than the other during symmetrical mudras.",
        correction: "Check your shoulder level in a mirror or against the 3D Guru's horizontal guide.",
      },
    ],
    traditionNotes:
      "The Abhinaya Darpana records 24 primary Samyukta Hastas; later treatises detail additional regional variants.",
    needsGuruReview: false,
    nextLessonSlug: "daily-revision-routine",
  },

  // ================= LEVEL 6: REVISION & CONTINUITY =================
  {
    id: "6-1",
    slug: "daily-revision-routine",
    level: 6,
    levelName: "Level 6: Revision & Continuity",
    title: "Daily Sadhana Routine: Warming Up, Posture Check & Practice Sequencing",
    subtitle: "An adaptable 30-minute practice template for steady long-term refinement",
    description:
      "Consistency (Abhyasa) is the bedrock of classical dance. This module outlines an optional, suggested 30-minute practice template: 5 minutes of joint warm-ups and spine mobility, 5 minutes of Namaskaram repetition, 10 minutes of Thattadavu footwork conditioning in 3 speeds, 5 minutes of mudra viniyoga recitation, and 5 minutes of cool-down and closing salutation. This template is not mandatory; beginners can start with 10–15 minutes and expand under their teacher's guidance.",
    durationMinutes: 15,
    prerequisites: [
      { slug: "namaskaram", title: "Part 1: Namaskaram" },
      { slug: "thattadavu", title: "Part 2: Thattadavu" },
      { slug: "asamyukta-hastas", title: "The 28 Single-Hand Gestures" },
    ],
    type: "revision",
    status: "verified-concept",
    hasMotionClip: false,
    objectives: [
      "Follow a structured 5-part daily training template (Warm-up, Namaskaram, Adavus, Mudras, Closing).",
      "Build cardiovascular endurance and isometric leg strength in Aramandi.",
      "Track practice consistency and milestones using the NrityaVaani dashboard.",
      "Cultivate internal discipline, breath awareness, and calm stamina.",
    ],
    keyConcepts: [
      {
        title: "Abhyasa (अभ्यास)",
        explanation: "Unbroken, dedicated practice over a prolonged duration with genuine reverence, as expounded in Patanjali's Yoga Sutras.",
      },
      {
        title: "Sadhana (साधना)",
        explanation: "Transforming physical repetition into spiritual devotion and artistic refinement.",
      },
    ],
    guruNote:
      "Twenty minutes of mindful, precise practice every day is ten times more transformative than two hours of exhausted practice once a week.",
    techniqueCues: [
      "Begin and end every session with full Namaskaram.",
      "Never skip the ankle and calf warm-up before entering speed drills.",
    ],
    commonMistakes: [
      {
        mistake: "Jumping directly into fast 3rd speed footwork with cold muscles.",
        correction: "Always warm up in slow 1st speed for at least 5 minutes before accelerating.",
      },
    ],
    traditionNotes:
      "Traditional Gurukulams wake students at Brahma Muhurta (dawn) for eye exercises (Drishti Bheda) and neck mobility (Griva Bheda) before footwork. Modern practitioners should adapt practice duration to personal endurance and teacher recommendations.",
    safetyAdvisory:
      "Practice duration should be calibrated to individual stamina. Never skip warm-up; never dance through sharp joint pain or severe fatigue.",
    needsGuruReview: false,
    nextLessonSlug: "curriculum-assessment-guide",
  },
  {
    id: "6-2",
    slug: "curriculum-assessment-guide",
    level: 6,
    levelName: "Level 6: Revision & Continuity",
    title: "Self-Reflective Checklist: Postural Balance, Weight & Rhythm",
    subtitle: "A guru-designed rubric to assess your own posture without cameras or scores",
    description:
      "True learning enables the dancer to become their own compassionate critic. This self-assessment guide provides a clear rubric based on the Natya Shastra's Anga Shuddhi (purity of body line). Use this checklist to audit your Aramandi depth, head alignment, hand clarity, and rhythmic precision. Self-evaluation supports personal awareness, but does not replace periodic feedback from an experienced Guru.",
    durationMinutes: 10,
    prerequisites: [{ slug: "daily-revision-routine", title: "Daily Sadhana Routine" }],
    type: "revision",
    status: "verified-concept",
    hasMotionClip: false,
    objectives: [
      "Evaluate your own posture against the 4 principles of Anga Shuddhi (limb purity).",
      "Identify common compensations in spinal curvature or knee angle.",
      "Formulate targeted revision goals for your next practice cycle.",
      "Integrate mirror observation with 3D Guru demonstration.",
    ],
    keyConcepts: [
      {
        title: "Anga Shuddhi (अङ्ग शुद्धि)",
        explanation: "Purity, precision, and clarity of the limbs and body lines in dance postures.",
      },
      {
        title: "Laya (लय)",
        explanation: "The intrinsic, unbroken tempo and rhythmic flow that binds movement to music.",
      },
    ],
    guruNote:
      "Be patient with your body. Flexibility and isometric stamina develop over months. Measure progress by clarity of line and peace of mind, not rushed speed.",
    techniqueCues: [
      "Periodically pause during an adavu and check your reflection: are your shoulders relaxed and elbows level?",
      "Listen intently to your foot strikes: do both feet sound equally crisp and resonant?",
    ],
    commonMistakes: [
      {
        mistake: "Ignoring subtle imbalances between the dominant right side and the weaker left side.",
        correction: "Give double practice attention to your non-dominant side until both sides match in strength.",
      },
    ],
    traditionNotes:
      "Traditional teachers listen with closed eyes to the sound of a student's footwork — the acoustic quality instantly reveals whether the sole landed flat.",
    needsGuruReview: false,
    nextLessonSlug: "namaskaram",
  },
];

/** Lookup helpers */
export function getLessonBySlug(slug: string): CurriculumLesson | undefined {
  const lesson = BHARATANATYAM_CURRICULUM.find((l) => l.slug === slug);
  if (!lesson) return undefined;
  const prov = getLessonProvenance(slug);
  return {
    ...lesson,
    provenance: prov,
    safetyAdvisory: lesson.safetyAdvisory || prov?.safetyAdvisory,
  };
}

export function getLessonsByLevel(level: number): CurriculumLesson[] {
  return BHARATANATYAM_CURRICULUM.filter((l) => l.level === level);
}

export function getAllCurriculumSlugs(): string[] {
  return BHARATANATYAM_CURRICULUM.map((l) => l.slug);
}
