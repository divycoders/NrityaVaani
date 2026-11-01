/**
 * Structured Teachable Chapters for the 3D Virtual Classroom.
 *
 * Every Bharatanatyam curriculum lesson is broken down into 8 pedagogy-first chapters:
 * 1. Guru Introduction (Welcoming & lineage context)
 * 2. Concept Foundation (Core concept breakdown)
 * 3. Visual Demonstration (Authentic 3D motion, 3D posture, 3D mudra, or concept visualizer)
 * 4. Important Details & Technique Cues (Alignment guidelines)
 * 5. Common Mistakes & Anatomical Safety (Turnout precautions, posture fixes)
 * 6. Chapter Recap (Key takeaways)
 * 7. Understanding Check (Interactive formative question)
 * 8. Next Steps & Transition (Progressive curriculum flow)
 */

import { getLessonBySlug, type CurriculumLesson } from "./curriculumData.ts";

export type VisualMode =
  | "mocap-3d"
  | "posture-3d"
  | "mudra-3d"
  | "concept-triad"
  | "rhythm-meter"
  | "mocap-in-production"
  | "presentation-3d";

export interface UnderstandingCheck {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonChapter {
  id: string;
  index: number;
  title: string;
  shortTitle: string;
  voiceScript: string;
  voiceScriptHi?: string;
  voiceScriptTa?: string;
  voiceScriptTe?: string;
  summary: string;
  visualMode: VisualMode;
  techniqueCues?: string[];
  commonMistakes?: { mistake: string; correction: string }[];
  understandingCheck?: UnderstandingCheck;
  relatedMudraSlug?: string;
  nextLessonSlug?: string;
  durationSeconds?: number;
}

/**
 * Returns the 8 structured teachable chapters for a curriculum lesson.
 */
export function getChaptersForLesson(
  lesson: CurriculumLesson,
  lang: string = "en"
): LessonChapter[] {
  const slug = lesson.slug;

  // Custom chapter suites for key pedagogical lessons
  if (slug === "intro-bharatanatyam") {
    return getIntroBharatanatyamChapters(lesson, lang);
  }
  if (slug === "samapada-and-aramandi") {
    return getAramandiChapters(lesson, lang);
  }
  if (slug === "asamyukta-hastas" || slug === "basic-hand-positions") {
    return getPatakaAndMudraChapters(lesson, lang);
  }
  if (slug === "namaskaram") {
    return getNamaskaramChapters(lesson, lang);
  }
  if (slug === "thattadavu") {
    return getThattadavuChapters(lesson, lang);
  }
  if (slug === "natta-adavu") {
    return getNattaAdavuChapters(lesson, lang);
  }
  if (slug === "adi-tala-and-rhythm" || slug === "sollukattu-art") {
    return getAdiTalaChapters(lesson, lang);
  }

  // Generic robust generator for remaining curriculum lessons
  return getGenericCurriculumChapters(lesson, lang);
}

// ============================================================================
// 1. INTRODUCTION TO BHARATANATYAM CHAPTERS
// ============================================================================
function getIntroBharatanatyamChapters(
  lesson: CurriculumLesson,
  _lang: string
): LessonChapter[] {
  return [
    {
      id: "intro",
      index: 0,
      title: "Guru Introduction: Welcome to Bharatanatyam",
      shortTitle: "Introduction",
      voiceScript:
        "Namaste and welcome, dear student. I am your 3D Virtual Guru. Today we embark on our classical Bharatanatyam journey together. Originating in the ancient temples of Tamil Nadu and codified in the Natya Shastra, Bharatanatyam is an unbroken tradition transmitting rhythm, geometry, and spiritual expression. Let us begin with reverence and clear focus.",
      summary:
        "Welcome to Bharatanatyam, India's classical temple dance rooted in the Natya Shastra.",
      visualMode: "presentation-3d",
    },
    {
      id: "concept",
      index: 1,
      title: "Concept Foundation: The Three Dimensions of Natya",
      shortTitle: "Three Facets",
      voiceScript:
        "Classical dance divides into three profound dimensions: Nritta, Nritya, and Natya. Nritta is pure rhythmic movement with geometric posture and no storytelling. Nritya brings lyrical emotion, combining rhythm with hand mudras and facial expressions. Natya is the dramatic art representing epic characters. Today, our focus is understanding this foundation.",
      summary:
        "Bharatanatyam integrates Nritta (pure rhythm), Nritya (rhythm + expression), and Natya (dramatic storytelling).",
      visualMode: "concept-triad",
    },
    {
      id: "demonstration",
      index: 2,
      title: "Visual Illustration: Nritta, Nritya & Natya in Practice",
      shortTitle: "Illustration",
      voiceScript:
        "Observe the visual concept diagram on screen. Notice how Nritta forms the geometric base of every adavu, while Nritya adds the sacred poetry of Hastas, and Natya brings the theatrical staging. A disciplined dancer masters all three harmoniously.",
      summary:
        "Explore the conceptual triad diagram showing how geometry, emotion, and drama intertwine.",
      visualMode: "concept-triad",
    },
    {
      id: "technique",
      index: 3,
      title: "Important Context: Guru-Shishya Parampara & Discipline",
      shortTitle: "Discipline",
      voiceScript:
        "In the Guru-Shishya tradition, classical dance is practiced as Sadhana, a dedicated meditation. Before beginning any physical movements, the dancer prepares the mind, respects the sacred space, and honors Mother Earth. Patience and daily repetition are the true keys to mastery.",
      summary:
        "Bharatanatyam is approached with spiritual devotion, discipline, and humility.",
      visualMode: "presentation-3d",
      techniqueCues: [
        "Approach every practice session with an uncluttered, focused mind",
        "Maintain upright spinal dignity (Saushtava) from day one",
        "Cultivate breath awareness and patient daily practice (Abhyasa)",
      ],
    },
    {
      id: "mistakes",
      index: 4,
      title: "Common Misconceptions: Speed vs. Foundation",
      shortTitle: "Mindset",
      voiceScript:
        "A common beginner mistake is rushing into rapid footwork without building steady posture. In Bharatanatyam, speed without clean lines is hollow. Always master slow tempo, Prathama Kalam, before attempting higher speeds.",
      summary:
        "Avoid rushing into fast footwork. Clean geometric alignment and steady balance come first.",
      visualMode: "presentation-3d",
      commonMistakes: [
        {
          mistake: "Rushing to fast footwork before building foundational posture",
          correction: "Practice slowly in Prathama Kalam until balance and geometry are effortless.",
        },
        {
          mistake: "Treating Bharatanatyam as merely physical exercise",
          correction: "Connect physical technique with inner devotion and emotional intent.",
        },
      ],
    },
    {
      id: "recap",
      index: 5,
      title: "Chapter Recap: The Essential Truths",
      shortTitle: "Recap",
      voiceScript:
        "Let us recap: Bharatanatyam is codified in the Natya Shastra, weaves together Nritta, Nritya, and Natya, and requires humble, consistent practice. Keep these principles in your heart as we advance to sacred attire and space preparation.",
      summary:
        "Remember: Ancient sacred origin, three dimensions of dance, and patient daily sadhana.",
      visualMode: "presentation-3d",
    },
    {
      id: "check",
      index: 6,
      title: "Understanding Check",
      shortTitle: "Quiz",
      voiceScript:
        "Let us check your understanding. Which component of Indian classical dance represents pure rhythmic, geometric movement without narrative storytelling?",
      summary: "Answer the Guru's question to test your conceptual clarity.",
      visualMode: "concept-triad",
      understandingCheck: {
        question:
          "Which element of classical Bharatanatyam represents pure rhythmic footwork and geometry without storytelling or expressional mime?",
        options: [
          "Nritta (Pure abstract dance)",
          "Nritya (Expressive dance with hastas)",
          "Natya (Dramatic theatre and dialogues)",
          "Abhinaya (Emotional mime)",
        ],
        correctIndex: 0,
        explanation:
          "Nritta is pure rhythmic dance consisting of foot strikes, body lines, and geometric arm extensions with no narrative meaning.",
      },
    },
    {
      id: "transition",
      index: 7,
      title: "Next Steps: Sacred Space & Attire",
      shortTitle: "Next Lesson",
      voiceScript:
        "Well done! You have completed the foundational orientation. Next, we will explore the sacred dance space, traditional practice sari, and Aharya preparation. Whenever you are ready, proceed to our next module.",
      summary: "Next Module: Sacred Space, Attire & Aharya Abhinaya.",
      visualMode: "presentation-3d",
      nextLessonSlug: "attire-and-environment",
    },
  ];
}

// ============================================================================
// 2. SAMAPADA & ARAMANDI POSTURE CHAPTERS
// ============================================================================
function getAramandiChapters(
  lesson: CurriculumLesson,
  _lang: string
): LessonChapter[] {
  return [
    {
      id: "intro",
      index: 0,
      title: "Guru Introduction: The Diamond Stance of Bharatanatyam",
      shortTitle: "Introduction",
      voiceScript:
        "Welcome back. Today we study the sacred diamond stance of Bharatanatyam: Aramandi, also known as Ayata Mandala, and its origin in Samapada. Aramandi is the foundational half-sitting posture from which almost all adavu movements emerge. Mastering Aramandi requires strength, safe hip rotation, and vertical spinal balance.",
      summary:
        "Aramandi (half-sitting posture) is the defining geometric diamond silhouette of Bharatanatyam.",
      visualMode: "posture-3d",
    },
    {
      id: "concept",
      index: 1,
      title: "Concept Foundation: Geometry of Samapada & Aramandi",
      shortTitle: "Geometry",
      voiceScript:
        "Samapada is the upright stance: feet together, spine elongated, and weight evenly distributed. In Aramandi, the knees flex outward laterally, forming a distinct diamond shape between the thighs, calves, and pelvis, while the torso remains dignified and centered.",
      summary:
        "From standing Samapada, the knees open outward laterally, creating a diamond silhouette.",
      visualMode: "posture-3d",
    },
    {
      id: "demonstration",
      index: 2,
      title: "Visual Demonstration: Inspect the 3D Stance",
      shortTitle: "3D Posture",
      voiceScript:
        "Observe the 3D Guru on screen. Notice how the knees track outward directly over the toes. Now, switch to the Side Profile view at ninety degrees. Notice that the spine is straight and not pitched forward. Use the viewpoint buttons to inspect the angles from all sides.",
      summary:
        "Inspect the 3D Guru in Front, Side ($90^\\circ$), and Three-Quarter ($45^\\circ$) views to observe vertical spinal alignment.",
      visualMode: "posture-3d",
    },
    {
      id: "technique",
      index: 3,
      title: "Essential Technique: Safe External Hip Rotation",
      shortTitle: "Technique Cues",
      voiceScript:
        "Pay close attention to safe anatomy. Turnout must originate from the external rotation of your hip joints, never forced at the knees or ankles. Keep your heels separated by approximately two to three fingers' width in the Kalakshetra tradition, and maintain your torso vertical like a pillar.",
      summary:
        "Turnout must come from hip rotation, not torque on the knees or ankles.",
      visualMode: "posture-3d",
      techniqueCues: [
        "Rotate outward from the hip sockets; never force foot turnout through knee pain",
        "Track knees directly over the middle toes without collapsing inward",
        "Keep the pelvis neutral without anterior tilt or exaggerated lumbar lordosis",
        "Maintain arms in Natyarambha, with elbows lifted horizontally at chest height",
      ],
    },
    {
      id: "mistakes",
      index: 4,
      title: "Common Mistakes: Knee Collapse & Leaning Forward",
      shortTitle: "Common Errors",
      voiceScript:
        "Two frequent mistakes occur: first, letting the knees cave inward, which places dangerous strain on the inner knee ligaments. Second, leaning the chest forward to compensate for tight hips. Keep your chest open, engage the gluteal muscles, and only descend as low as your hips safely allow.",
      summary:
        "Never let knees cave inward. Keep the spine vertical without leaning forward.",
      visualMode: "posture-3d",
      commonMistakes: [
        {
          mistake: "Knees collapsing inward (valgus collapse)",
          correction: "Engage outer hip rotators to draw the knees backward over the toes.",
        },
        {
          mistake: "Leaning torso forward like a squat",
          correction: "Lengthen through the crown of the head; maintain vertical spinal line.",
        },
      ],
    },
    {
      id: "recap",
      index: 5,
      title: "Chapter Recap: Aramandi Mastery",
      shortTitle: "Recap",
      voiceScript:
        "Let us recap: Aramandi is a diamond posture formed by lateral knee opening. Turnout originates from the hips. The spine remains upright. Hold this stance with steady breathing for thirty seconds every day to build classical endurance.",
      summary:
        "Key checkpoints: Diamond silhouette, hip turnout, vertical spine, knees over toes.",
      visualMode: "posture-3d",
    },
    {
      id: "check",
      index: 6,
      title: "Understanding Check",
      shortTitle: "Quiz",
      voiceScript:
        "Here is a vital safety question: Where must the outward turnout of the legs originate when sinking into Aramandi?",
      summary: "Answer the anatomical safety question.",
      visualMode: "posture-3d",
      understandingCheck: {
        question:
          "Where must the anatomical turnout originate to safely perform Aramandi without injuring the joints?",
        options: [
          "External rotation of the hip joints",
          "Forcing the knees outward against resistance",
          "Twisting the ankle joints and feet to 180 degrees",
          "Bending forward from the lower back",
        ],
        correctIndex: 0,
        explanation:
          "Turnout must originate exclusively from the hip sockets. Forcing turnout at the knees or ankles causes ligament strain and joint injuries.",
      },
    },
    {
      id: "transition",
      index: 7,
      title: "Next Steps: Natyarambha & Hand Placement",
      shortTitle: "Next Lesson",
      voiceScript:
        "Magnificent work! With your Aramandi posture established, our next step is learning Natyarambha: the broad, graceful arm extension that defines Bharatanatyam's upper body geometry. Let us continue.",
      summary: "Next Module: Natyarambha & Fundamental Arm Placement.",
      visualMode: "posture-3d",
      nextLessonSlug: "basic-hand-positions",
    },
  ];
}

// ============================================================================
// 3. PATAKA HASTA & MUDRA CHAPTERS
// ============================================================================
function getPatakaAndMudraChapters(
  lesson: CurriculumLesson,
  _lang: string
): LessonChapter[] {
  return [
    {
      id: "intro",
      index: 0,
      title: "Guru Introduction: The Language of Hastas",
      shortTitle: "Introduction",
      voiceScript:
        "Namaste. Today we explore the sacred language of the hands: the Hastas, also known as Mudras. The Abhinaya Darpana codifies twenty-eight single-hand gestures, Asamyukta Hastas, starting with the primary mudra: Pataka Hasta. Hands in Indian dance are poetic paintbrushes that speak without words.",
      summary:
        "Hastās (mudras) are the expressive alphabet of Bharatanatyam, beginning with Pataka Hasta.",
      visualMode: "mudra-3d",
      relatedMudraSlug: "pataka",
    },
    {
      id: "concept",
      index: 1,
      title: "Concept Foundation: What is Pataka Hasta?",
      shortTitle: "The Flag",
      voiceScript:
        "Pataka means 'flag'. It is formed by extending all four fingers straight and close together without any gaps, while bending the thumb softly inward toward the base of the index finger. It represents firmness, dignity, and expansive space.",
      summary:
        "Pataka (Flag): All four fingers pressed straight together, thumb bent softly toward index base.",
      visualMode: "mudra-3d",
      relatedMudraSlug: "pataka",
    },
    {
      id: "demonstration",
      index: 2,
      title: "Visual Demonstration: Inspect the 3D Mudra",
      shortTitle: "3D Mudra",
      voiceScript:
        "Look at the 3D hand demonstration on screen. Rotate the hand to observe the complete closure of the fingers. Notice how the palm remains flat and taut, and the thumb rests smoothly against the edge of the palm without curling inward clumsily.",
      summary:
        "Rotate the 3D Pataka Hasta to inspect the straight finger alignment and thumb placement.",
      visualMode: "mudra-3d",
      relatedMudraSlug: "pataka",
    },
    {
      id: "technique",
      index: 3,
      title: "Classical Viniyoga: Traditional Applications",
      shortTitle: "Viniyogas",
      voiceScript:
        "According to the Abhinaya Darpana, Pataka is used in sacred dance to depict clouds, a dense forest, the night sky, rolling rivers, cutting of waves, and granting blessings or peace. The orientation of the palm transforms its poetic meaning.",
      summary:
        "Verified Viniyogas: Depicting clouds, forests, rivers, waves, night, and offering blessing.",
      visualMode: "mudra-3d",
      relatedMudraSlug: "pataka",
      techniqueCues: [
        "Keep all four fingers firmly joined with no daylight between them",
        "Bend the thumb softly at the second knuckle toward the side of the palm",
        "Extend through the wrist with energetic intention; do not drop the hand limply",
      ],
    },
    {
      id: "mistakes",
      index: 4,
      title: "Common Mistakes: Gaps & Limp Wrists",
      shortTitle: "Mistakes",
      voiceScript:
        "Beginners often allow gaps between the fingers, let the fingertips bend backward passively, or drop the wrist. Remember: classical hand gestures require energized prana through every fingertip.",
      summary:
        "Avoid gaps between fingers, bent knuckles, or dropping the wrist line.",
      visualMode: "mudra-3d",
      relatedMudraSlug: "pataka",
      commonMistakes: [
        {
          mistake: "Gaps between the fingers (letting fingers splay)",
          correction: "Gently press all four fingers together so no gaps appear.",
        },
        {
          mistake: "Tucking the thumb into the palm like a fist",
          correction: "Bend only the thumb tip against the side base of the index finger.",
        },
      ],
    },
    {
      id: "recap",
      index: 5,
      title: "Chapter Recap: Pataka Mastery",
      shortTitle: "Recap",
      voiceScript:
        "Let us recap: Pataka is the foundational single-hand mudra representing a flag. All four fingers are held straight and pressed together, thumb bent softly. It opens our study of the twenty-eight classical hastas.",
      summary:
        "Pataka = Straight fingers joined + bent thumb. Key to adavus and abhinaya.",
      visualMode: "mudra-3d",
      relatedMudraSlug: "pataka",
    },
    {
      id: "check",
      index: 6,
      title: "Understanding Check",
      shortTitle: "Quiz",
      voiceScript:
        "Let us test your knowledge: In classical Bharatanatyam, how should the four fingers be positioned in Pataka Hasta?",
      summary: "Answer the hand formation question.",
      visualMode: "mudra-3d",
      relatedMudraSlug: "pataka",
      understandingCheck: {
        question:
          "What is the correct finger configuration for Pataka Hasta according to the Abhinaya Darpana?",
        options: [
          "All four fingers held straight and pressed close together, thumb bent softly",
          "Index and middle fingers spread apart in a V-shape",
          "Fingers tightly curled inward into a fist",
          "Only the pinky and index fingers extended upward",
        ],
        correctIndex: 0,
        explanation:
          "Pataka Hasta requires all four fingers to be extended straight and touching closely without gaps, with the thumb bent against the side base of the index finger.",
      },
    },
    {
      id: "transition",
      index: 7,
      title: "Next Steps: Explore the 3D Mudra Library",
      shortTitle: "Next Lesson",
      voiceScript:
        "Wonderful! You have learned Pataka Hasta. You can now explore all twenty-eight verified mudras in our interactive 3D Mudra Library, or proceed to Level Three to learn Namaskaram.",
      summary: "Next: Explore the Mudra Library or proceed to Namaskaram.",
      visualMode: "mudra-3d",
      nextLessonSlug: "namaskaram",
    },
  ];
}

// ============================================================================
// 4. NAMASKARAM CHAPTERS (Interactive 3D Motion Take)
// ============================================================================
function getNamaskaramChapters(
  lesson: CurriculumLesson,
  _lang: string
): LessonChapter[] {
  return [
    {
      id: "intro",
      index: 0,
      title: "Guru Introduction: The Sacred Salutation",
      shortTitle: "Introduction",
      voiceScript:
        "Namaste. Today we perform Namaskaram, also known as Bhumi Pranam. This is the sacred salutation performed before and after every dance sadhana. Through Namaskaram, we offer reverence to God, seek blessings from the Guru, ask forgiveness from Mother Earth for striking her with our feet, and greet the gathering.",
      summary:
        "Namaskaram is the sacred ritual salutation performed before and after every Bharatanatyam practice.",
      visualMode: "mocap-3d",
    },
    {
      id: "concept",
      index: 1,
      title: "Concept Foundation: The Three Reverences of Bhumi Pranam",
      shortTitle: "Philosophy",
      voiceScript:
        "Namaskaram incorporates three profound acts of respect: first, the Guru Vandana honoring our teachers; second, touching Mother Earth in gratitude and bringing that blessing to our eyes; and third, greeting the assembly with palms joined in Anjali Mudra. It centers the ego and cultivates humility.",
      summary:
        "Three reverences: Divine grace & lineage, Mother Earth forgiveness, and assembly salutation.",
      visualMode: "mocap-3d",
    },
    {
      id: "demonstration",
      index: 2,
      title: "Visual 3D Demonstration: The 11 Sequential Steps",
      shortTitle: "3D Motion Take",
      voiceScript:
        "Watch the 3D Guru demonstrate all eleven sequential steps of Namaskaram. You can play, pause, select any step, and slow the playback to zero-point-five or zero-point-seven-five speed. Rotate the camera to examine the descent into Muzhumandi and the touch of the earth.",
      summary:
        "Watch all 11 verified steps with authentic 60 FPS motion playback and multi-angle camera controls.",
      visualMode: "mocap-3d",
    },
    {
      id: "technique",
      index: 3,
      title: "Technique Cues: Stepping, Descent & Anjali Mudra",
      shortTitle: "Technique",
      voiceScript:
        "Step firmly with the right foot, then left, opening into Natyarambha arms. Descend with control through Aramandi into Muzhumandi, the full sitting posture. Keep your spine erect as you touch Mother Earth with flat palms and reverently touch your eyes.",
      summary:
        "Smooth descent from Samapada to Aramandi to Muzhumandi, maintaining spinal poise.",
      visualMode: "mocap-3d",
      techniqueCues: [
        "Strike the right foot then left foot firmly in rhythm",
        "Extend arms sideways in graceful Natyarambha",
        "Lower smoothly into Muzhumandi on the balls of your feet",
        "Touch the earth with both palms, then gently touch your eyelids",
        "Rise with control and offer Anjali Mudra at chest level",
      ],
    },
    {
      id: "mistakes",
      index: 4,
      title: "Common Mistakes: Rushing & Losing Balance",
      shortTitle: "Precautions",
      voiceScript:
        "Avoid collapsing downward hurriedly into Muzhumandi. The descent should be smooth and controlled. Keep your torso balanced over your heels rather than toppling forward when touching the floor.",
      summary:
        "Avoid dropping abruptly to the floor; control the descent through leg strength.",
      visualMode: "mocap-3d",
      commonMistakes: [
        {
          mistake: "Collapsing abruptly downward into Muzhumandi",
          correction: "Control the descent using inner thigh and quadriceps strength.",
        },
        {
          mistake: "Treating the touch of the earth casually",
          correction: "Pause with genuine reverence as your fingertips touch the floor.",
        },
      ],
    },
    {
      id: "recap",
      index: 5,
      title: "Chapter Recap: Namaskaram Complete",
      shortTitle: "Recap",
      voiceScript:
        "Let us recap: Namaskaram is our sacred boundary. It begins and ends our sadhana. Practice this sequence daily before starting any adavu footwork.",
      summary:
        "Always begin and conclude dance sadhana with conscious Namaskaram.",
      visualMode: "mocap-3d",
    },
    {
      id: "check",
      index: 6,
      title: "Understanding Check",
      shortTitle: "Quiz",
      voiceScript:
        "Why does a classical dancer touch Mother Earth and bring fingertips to the eyes during Namaskaram?",
      summary: "Answer the philosophical purpose question.",
      visualMode: "mocap-3d",
      understandingCheck: {
        question:
          "What is the philosophical and spiritual reason a Bharatanatyam dancer touches the earth during Namaskaram?",
        options: [
          "To ask Mother Earth's forgiveness and blessing before stamping upon her in dance",
          "To check if the wooden stage floor is slippery",
          "To stretch the hamstring muscles before practicing adavus",
          "To signal to the musicians that the rhythm is about to start",
        ],
        correctIndex: 0,
        explanation:
          "Stamping during adavus strikes the earth vigorously. In Bhumi Pranam, we touch Mother Earth and bring her blessing to our eyes, asking forgiveness and guidance.",
      },
    },
    {
      id: "transition",
      index: 7,
      title: "Next Steps: Thattadavu (Tatta Adavu)",
      shortTitle: "Next Lesson",
      voiceScript:
        "Congratulations! You have mastered the sacred salutation. Next, we begin our foundational adavu footwork with Part Two: Thattadavu. Proceed whenever you are ready.",
      summary: "Next Module: Part 2: Thattadavu (The Eight Footwork Drills).",
      visualMode: "mocap-3d",
      nextLessonSlug: "thattadavu",
    },
  ];
}

// ============================================================================
// 5. THATTADAVU CHAPTERS (Interactive 3D Motion Take)
// ============================================================================
function getThattadavuChapters(
  lesson: CurriculumLesson,
  _lang: string
): LessonChapter[] {
  return [
    {
      id: "intro",
      index: 0,
      title: "Guru Introduction: Thattadavu Footwork Foundation",
      shortTitle: "Introduction",
      voiceScript:
        "Welcome to Thattadavu, the primary adavu of Bharatanatyam. The word comes from 'Tattu', meaning to strike flat. Thattadavu trains the dancer's feet to stamp with resonant power, rhythm, and stability in constant Aramandi posture with hands anchored at the waist in Kati Hastha.",
      summary:
        "Thattadavu is the foundational flat-sole stamping adavu that instills rhythm, balance, and leg stamina.",
      visualMode: "mocap-3d",
    },
    {
      id: "concept",
      index: 1,
      title: "Concept Foundation: Flat Strikes & The Three Speeds",
      shortTitle: "Three Speeds",
      voiceScript:
        "Thattadavu is practiced in three speeds or Kalams: Prathama Kalam at one strike per beat, Dvitheeya Kalam at two strikes per beat, and Thritheeya Kalam at four strikes per beat. Through all speeds, the upper body must remain still without bouncing.",
      summary:
        "Practiced across 3 Kalams (1x, 2x, 4x speeds) in 8-beat Adi Tala.",
      visualMode: "mocap-3d",
    },
    {
      id: "demonstration",
      index: 2,
      title: "Visual 3D Demonstration: The 8 Footwork Steps",
      shortTitle: "3D Motion Take",
      voiceScript:
        "Observe the 3D Guru performing Thattadavu. Use the playback speed button to slow down to zero-point-five or zero-point-seven-five speed. Rotate to the Side View to verify that the heels lift cleanly and stamp with the entire flat sole.",
      summary:
        "Watch all 8 variations of Thattadavu with complete 60 FPS motion and multi-speed controls.",
      visualMode: "mocap-3d",
    },
    {
      id: "technique",
      index: 3,
      title: "Technique Cues: Kati Hastha & Resonant Stamping",
      shortTitle: "Technique",
      voiceScript:
        "Place your hands firmly behind your waist in Kati Hastha, thumbs pointing forward. Lift the foot cleanly from the knee, and strike down with the entire flat foot to create a sharp, resonant sound. Breathe rhythmically on each beat.",
      summary:
        "Keep hands on waist (Kati Hastha), lift foot from knee, stamp entire flat sole.",
      visualMode: "mocap-3d",
      techniqueCues: [
        "Hands anchored firmly behind waist in Kati Hastha",
        "Lift foot with control; strike floor firmly with the entire sole",
        "Maintain deep Aramandi without letting the hips rise and fall with each stamp",
        "Recite the sollukattu: 'Tai Ya Tai Hi, Tai Ya Tai Hi'",
      ],
    },
    {
      id: "mistakes",
      index: 4,
      title: "Common Mistakes: Bouncing Torso & Rising from Aramandi",
      shortTitle: "Corrections",
      voiceScript:
        "The most widespread beginner fault is bobbing or bouncing up and down with every stamp. Your pelvis must remain on an even horizontal plane. Another error is stamping on the toes; the entire sole must strike the earth firmly.",
      summary:
        "Do not bounce your torso. Keep the pelvis at a fixed depth throughout the rhythm cycle.",
      visualMode: "mocap-3d",
      commonMistakes: [
        {
          mistake: "Torso bobbing up and down with each strike",
          correction: "Anchor your hips at a constant height; isolate leg movement.",
        },
        {
          mistake: "Striking only with the ball of the foot",
          correction: "Ensure the full flat sole strikes evenly to produce a resonant sound.",
        },
      ],
    },
    {
      id: "recap",
      index: 5,
      title: "Chapter Recap: Rhythm in Body and Mind",
      shortTitle: "Recap",
      voiceScript:
        "Let us recap: Thattadavu builds the dancer's rhythmic foundation. Stamp flat, maintain steady Aramandi, keep hands in Kati Hastha, and recite the syllables 'Tai Ya Tai Hi' in Adi Tala.",
      summary:
        "Key elements: Flat sole strike, steady Aramandi, Kati Hastha, 3 Kalams.",
      visualMode: "mocap-3d",
    },
    {
      id: "check",
      index: 6,
      title: "Understanding Check",
      shortTitle: "Quiz",
      voiceScript:
        "Let us test your understanding: What rhythmic sollukattu syllables accompany the first step of Thattadavu?",
      summary: "Answer the rhythm syllable question.",
      visualMode: "mocap-3d",
      understandingCheck: {
        question:
          "What is the traditional Sollukattu syllable sequence recited for the first speed of Thattadavu?",
        options: [
          "Tai Ya Tai Hi, Tai Ya Tai Hi",
          "Tai Yum Tat Tat, Tai Yum Tam",
          "Tat Tai Ta Ha, Dhit Tai Ta Ha",
          "Dhit Tai Yum Tat, Tat Tai Ta",
        ],
        correctIndex: 0,
        explanation:
          "The foundational sollukattu for Thattadavu is 'Tai Ya Tai Hi', where each strike synchronizes with one beat of the tala cycle.",
      },
    },
    {
      id: "transition",
      index: 7,
      title: "Next Steps: Natta Adavu & Heel Strikes",
      shortTitle: "Next Lesson",
      voiceScript:
        "Superb progress! You have mastered the flat stamps of Thattadavu. Next, we explore Natta Adavu, introducing heel strikes and sweeping Tripataka arm extensions. Let us move forward.",
      summary: "Next Module: Part 3: Natta Adavu (Heel Strikes & Arm Extensions).",
      visualMode: "mocap-3d",
      nextLessonSlug: "natta-adavu",
    },
  ];
}

// ============================================================================
// 6. NATTA ADAVU CHAPTERS (In-Production Transparent State)
// ============================================================================
function getNattaAdavuChapters(
  lesson: CurriculumLesson,
  _lang: string
): LessonChapter[] {
  return [
    {
      id: "intro",
      index: 0,
      title: "Guru Introduction: Natta Adavu & The Reach of the Limbs",
      shortTitle: "Introduction",
      voiceScript:
        "Welcome to Natta Adavu. Where Thattadavu is stationary and inward, Natta Adavu reaches out into space. The word comes from 'Nattu', meaning to plant or anchor firmly. In this adavu, we introduce Kutti Thattu heel strikes, lateral leg reaches, and Tripataka arm extensions.",
      summary:
        "Natta Adavu expands movement into space with heel strikes (Kutti Thattu) and Tripataka arms.",
      visualMode: "mocap-in-production",
    },
    {
      id: "concept",
      index: 1,
      title: "Concept Foundation: The Contrast with Tatta Adavu",
      shortTitle: "Contrast",
      voiceScript:
        "Let us understand the contrast: Tatta Adavu uses purely flat strikes with hands on waist. Natta Adavu introduces heel planting, dynamic weight transfer across the hips, and sweeps the arms in wide arcs accompanied by coordinated eye gaze, Drishti Bheda.",
      summary:
        "Tatta Adavu = flat stamps on waist. Natta Adavu = heel strikes, sweeping arms, and eye gaze.",
      visualMode: "mocap-in-production",
    },
    {
      id: "demonstration",
      index: 2,
      title: "Studio Production Notice: Verified Theory & Studio Recording",
      shortTitle: "Studio Capture",
      voiceScript:
        "Please note our transparent studio status: high-fidelity 3D motion capture for Natta Adavu is currently in production with our Natyacharya team. We do not generate fake animations. The step theory, rhythm syllables, and technique cues below are fully authenticated from classical texts.",
      summary:
        "Studio Notice: Motion capture is scheduled for studio recording. Verified theory and footwork cues are provided.",
      visualMode: "mocap-in-production",
    },
    {
      id: "technique",
      index: 3,
      title: "Technique Cues: Heel Placement & Tripataka Arms",
      shortTitle: "Technique",
      voiceScript:
        "When extending the leg, plant the heel firmly with the foot flexed upward at forty-five degrees. The corresponding arm extends into Tripataka Hasta at shoulder height, while your eyes follow the hand with crisp focus.",
      summary:
        "Flex foot and plant heel firmly (Kutti Thattu); coordinate sweeping Tripataka arm and gaze.",
      visualMode: "mocap-in-production",
      techniqueCues: [
        "Reach the heel outward diagonally while sinking deeper into the standing knee's Aramandi",
        "Form clean Tripataka Hasta (Pataka with ring finger bent)",
        "Coordinate your eye gaze (Drishti) with the movement of the hand",
        "Recite the sollukattu: 'Tai Yum Tat Tat, Tai Yum Tam'",
      ],
    },
    {
      id: "mistakes",
      index: 4,
      title: "Common Mistakes: Collapsing Standing Knee",
      shortTitle: "Mistakes",
      voiceScript:
        "A common fault in Natta Adavu is straightening the standing leg when reaching the other leg out. Maintain full Aramandi in the supporting leg so your center of gravity remains low and balanced.",
      summary:
        "Do not straighten the supporting knee when reaching the other foot out.",
      visualMode: "mocap-in-production",
      commonMistakes: [
        {
          mistake: "Straightening the standing knee when extending the working leg",
          correction: "Keep the supporting leg anchored in deep Aramandi for balance.",
        },
        {
          mistake: "Letting the arm drop below shoulder level in Tripataka",
          correction: "Maintain energetic arm alignment parallel to the floor.",
        },
      ],
    },
    {
      id: "recap",
      index: 5,
      title: "Chapter Recap: Natta Adavu Principles",
      shortTitle: "Recap",
      voiceScript:
        "Let us recap: Natta Adavu introduces heel planting, expansive Tripataka arm lines, and eye gaze coordination. Practice the footwork drill with 'Tai Yum Tat Tat' rhythm.",
      summary:
        "Key takeaways: Heel strikes, Tripataka arm reach, eye coordination, supporting Aramandi.",
      visualMode: "mocap-in-production",
    },
    {
      id: "check",
      index: 6,
      title: "Understanding Check",
      shortTitle: "Quiz",
      voiceScript:
        "How is the foot placed on the floor during the first movement of Natta Adavu?",
      summary: "Answer the footwork strike question.",
      visualMode: "mocap-in-production",
      understandingCheck: {
        question:
          "What part of the foot strikes the floor first in the extension phase of Natta Adavu?",
        options: [
          "The heel strikes firmly with toes flexed upward (Kutti Thattu)",
          "The flat sole stamps as in Thattadavu",
          "Only the tip of the big toe touches the floor",
          "The outer edge of the foot",
        ],
        correctIndex: 0,
        explanation:
          "Natta Adavu introduces Kutti Thattu, where the heel strikes the floor firmly with toes flexed upward, accompanied by Tripataka arm extensions.",
      },
    },
    {
      id: "transition",
      index: 7,
      title: "Next Steps: Rhythm & Adi Tala",
      shortTitle: "Next Lesson",
      voiceScript:
        "Excellent! With footwork foundations in place, our next level explores the rhythmic engine of Bharatanatyam: the 8-beat Adi Tala and Carnatic tempo transitions. Let us advance to Level Four.",
      summary: "Next Module: Level 4: Understanding Adi Tala & Metric Cycles.",
      visualMode: "mocap-in-production",
      nextLessonSlug: "adi-tala-and-rhythm",
    },
  ];
}

// ============================================================================
// 7. ADI TALA & RHYTHM CHAPTERS
// ============================================================================
function getAdiTalaChapters(
  lesson: CurriculumLesson,
  _lang: string
): LessonChapter[] {
  return [
    {
      id: "intro",
      index: 0,
      title: "Guru Introduction: The Metric Heartbeat of Dance",
      shortTitle: "Introduction",
      voiceScript:
        "Namaste. Today we explore Tala: the cyclical rhythmic heartbeat of Carnatic music and Bharatanatyam. The most fundamental and widely used tala is Adi Tala, an eight-beat metric cycle that governs our adavus, sollukattus, and foot strikes.",
      summary:
        "Adi Tala is the 8-beat metric cycle that provides the rhythmic architecture of Bharatanatyam.",
      visualMode: "rhythm-meter",
    },
    {
      id: "concept",
      index: 1,
      title: "Concept Foundation: Structure of Adi Tala (Chaturashra Jaati)",
      shortTitle: "Structure",
      voiceScript:
        "Adi Tala belongs to the Chaturashra Jaati Triputa Tala family. It consists of eight counts structured into one Laghu of four counts (a clap followed by counting three fingers), followed by two Dhrutams of two counts each (clap and wave, clap and wave).",
      summary:
        "8 Beats = 1 Laghu (clap + 3 finger counts) + 2 Dhrutams (clap + wave each).",
      visualMode: "rhythm-meter",
    },
    {
      id: "demonstration",
      index: 2,
      title: "Visual 8-Beat Visualizer: Clapping & Counting",
      shortTitle: "Beat Meter",
      voiceScript:
        "Look at the 8-beat rhythmic visualizer on screen. Watch the beat pulse: beat one is a clap; beats two, three, and four count the pinky, ring, and middle fingers; beat five is a clap; beat six is a wave; beat seven is a clap; beat eight is a wave.",
      summary:
        "Follow the visual 8-beat meter: Clap-1, 2, 3, 4, Clap-5, Wave-6, Clap-7, Wave-8.",
      visualMode: "rhythm-meter",
    },
    {
      id: "technique",
      index: 3,
      title: "Technique Cues: Synchronizing Footwork and Tala",
      shortTitle: "Coordination",
      voiceScript:
        "When dancing adavus, your foot strikes must synchronize precisely with the tala counts. Keep your inner metronome steady without rushing when the foot lifts off the ground.",
      summary:
        "Lock foot strikes directly to the beat pulse; maintain internal metronome steady.",
      visualMode: "rhythm-meter",
      techniqueCues: [
        "Beat 1: Clap palm firmly on thigh or hand",
        "Beats 2, 3, 4: Touch little finger, ring finger, middle finger with thumb",
        "Beats 5 & 6: Clap and turn palm upward into a wave",
        "Beats 7 & 8: Clap and turn palm upward into a wave",
      ],
    },
    {
      id: "mistakes",
      index: 4,
      title: "Common Mistakes: Speeding Up & Weak Claps",
      shortTitle: "Mistakes",
      voiceScript:
        "The most frequent rhythmic error is speeding up (laya bhrashta), particularly during finger counts or wave transitions. Practice with an audio metronome or sollukattu recitation until the tempo is rock steady.",
      summary:
        "Avoid rushing the finger counts. Keep each beat spaced with mathematical precision.",
      visualMode: "rhythm-meter",
      commonMistakes: [
        {
          mistake: "Accelerating during the finger counts (beats 2, 3, 4)",
          correction: "Keep intervals between finger counts exactly equal to the clap intervals.",
        },
      ],
    },
    {
      id: "recap",
      index: 5,
      title: "Chapter Recap: The 8-Beat Cycle",
      shortTitle: "Recap",
      voiceScript:
        "Let us recap: Adi Tala has eight beats divided into a four-beat Laghu and two two-beat Dhrutams. It is the rhythmic foundation of your dance sadhana.",
      summary:
        "8 counts: Laghu (4) + Dhrutam (2) + Dhrutam (2).",
      visualMode: "rhythm-meter",
    },
    {
      id: "check",
      index: 6,
      title: "Understanding Check",
      shortTitle: "Quiz",
      voiceScript:
        "How many beats make up one complete cycle of Adi Tala?",
      summary: "Answer the tala count question.",
      visualMode: "rhythm-meter",
      understandingCheck: {
        question: "How many total beats (aksharas) are in one complete cycle of Adi Tala?",
        options: ["8 beats", "6 beats", "7 beats", "10 beats"],
        correctIndex: 0,
        explanation:
          "Adi Tala is an 8-beat cycle (Chaturashra Jaati Triputa Tala), composed of 1 Laghu of 4 counts plus 2 Dhrutams of 2 counts each.",
      },
    },
    {
      id: "transition",
      index: 7,
      title: "Next Steps: The Art of Sollukattu",
      shortTitle: "Next Lesson",
      voiceScript:
        "Well done! You now understand the metric pulse of Adi Tala. Next, we practice reciting the rhythmic dance syllables: the art of Sollukattu across three speeds.",
      summary: "Next Module: The Art of Sollukattu & Three Speeds (Kalams).",
      visualMode: "rhythm-meter",
      nextLessonSlug: "sollukattu-art",
    },
  ];
}

// ============================================================================
// 8. GENERIC CURRICULUM CHAPTER GENERATOR (For all other lessons)
// ============================================================================
function getGenericCurriculumChapters(
  lesson: CurriculumLesson,
  _lang: string
): LessonChapter[] {
  const visualMode: VisualMode = lesson.hasMotionClip
    ? "mocap-3d"
    : lesson.status === "mocap-pending"
    ? "mocap-in-production"
    : "presentation-3d";

  const conceptsSummary = lesson.keyConcepts
    .slice(0, 2)
    .map((c) => `${c.title}: ${c.explanation}`)
    .join(" ");

  return [
    {
      id: "intro",
      index: 0,
      title: `Guru Introduction: ${lesson.title}`,
      shortTitle: "Introduction",
      voiceScript: `Namaste and welcome. Today we explore ${lesson.title}. This module forms an essential part of ${lesson.levelName}. ${lesson.subtitle}. Let us begin our focused study.`,
      summary: lesson.description.slice(0, 160) + "...",
      visualMode,
    },
    {
      id: "concept",
      index: 1,
      title: "Concept Foundation: Core Principles",
      shortTitle: "Principles",
      voiceScript: `Let us examine the key concepts: ${conceptsSummary} Remember that classical dance requires clarity of thought before clarity of motion.`,
      summary: conceptsSummary,
      visualMode,
    },
    {
      id: "demonstration",
      index: 2,
      title: "Visual Demonstration & Study",
      shortTitle: "Visual Study",
      voiceScript: `Observe the visual presentation carefully. Notice the posture lines, geometric spacing, and the Guru's guidance. Study the alignment points closely.`,
      summary: `Visual study for ${lesson.title}.`,
      visualMode,
    },
    {
      id: "technique",
      index: 3,
      title: "Essential Technique Cues",
      shortTitle: "Technique",
      voiceScript: `Here are the essential technique cues to follow: ${lesson.techniqueCues.slice(0, 3).join(". ")}. Always maintain upright poise and calm breathing.`,
      summary: "Bulleted posture and technique cues for this module.",
      visualMode,
      techniqueCues: lesson.techniqueCues,
    },
    {
      id: "mistakes",
      index: 4,
      title: "Common Mistakes & Corrections",
      shortTitle: "Corrections",
      voiceScript:
        lesson.commonMistakes.length > 0
          ? `Avoid this common mistake: ${lesson.commonMistakes[0].mistake}. The classical correction is: ${lesson.commonMistakes[0].correction}.`
          : "Maintain careful attention to spinal alignment and avoid collapsing the posture under fatigue.",
      summary: "Precautions and correction guidelines.",
      visualMode,
      commonMistakes: lesson.commonMistakes,
    },
    {
      id: "recap",
      index: 5,
      title: "Chapter Recap: Key Learnings",
      shortTitle: "Recap",
      voiceScript: `Let us recap: We have explored ${lesson.title}. Remember the Guru's guidance: "${lesson.guruNote}". Practice with patience.`,
      summary: `Summary: ${lesson.guruNote}`,
      visualMode,
    },
    {
      id: "check",
      index: 6,
      title: "Understanding Check",
      shortTitle: "Quiz",
      voiceScript: `Let us check your understanding of ${lesson.title}. Answer the question on screen to verify your comprehension.`,
      summary: "Answer the formative check question.",
      visualMode,
      understandingCheck: {
        question: `What is the primary pedagogical objective of ${lesson.title}?`,
        options: [
          lesson.objectives[0] || "Master foundational alignment and rhythmic balance",
          "Perform fast acrobatics without regard to posture",
          "Skip theory and practice without classical guidance",
        ],
        correctIndex: 0,
        explanation:
          lesson.objectives[0] ||
          "Classical Bharatanatyam requires disciplined mastery of foundational posture and alignment.",
      },
    },
    {
      id: "transition",
      index: 7,
      title: "Next Steps: Progressive Advancement",
      shortTitle: "Next Lesson",
      voiceScript:
        lesson.nextLessonSlug
          ? `Splendid! You have completed this module. When you are ready, continue to your next lesson.`
          : "Splendid! You have completed this module. Keep practicing your daily sadhana.",
      summary: lesson.nextLessonSlug
        ? `Next recommended module: ${lesson.nextLessonSlug}.`
        : "Module complete. Continue daily practice.",
      visualMode,
      nextLessonSlug: lesson.nextLessonSlug,
    },
  ];
}

/**
 * Returns the best localized narration script for a chapter.
 */
export function getChapterVoiceScript(chapter: LessonChapter, lang: string = "en"): string {
  if (lang === "hi" && chapter.voiceScriptHi) return chapter.voiceScriptHi;
  if (lang === "ta" && chapter.voiceScriptTa) return chapter.voiceScriptTa;
  if (lang === "te" && chapter.voiceScriptTe) return chapter.voiceScriptTe;
  return chapter.voiceScript;
}
