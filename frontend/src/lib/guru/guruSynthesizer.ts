import { getLanguageConfig } from "./languageCatalog.ts";
/**
 * Grounded Guru Response Synthesizer.
 *
 * Blends lightweight LLM generation (when server keys are configured)
 * with a deterministic, verified rule-based synthesizer (for offline, test,
 * and keyless environments).
 *
 * Enforces validation-aware grounding:
 * - Source-supported: verified against classical texts & repository motion data.
 * - Guru-review-required: presented as provisional with explicit safety advisory.
 * - In-production: studio mocap is explicitly noted as in-production without false availability claims.
 * - Active step context: incorporates step number, gloss, technique cues, and rhythm.
 * - Out-of-scope: honest pedagogical boundary refusal without external hallucinations.
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { RetrievedContext } from "./knowledgeRetriever.ts";

const DEEPSEEK_MODEL = "deepseek-chat";
const DEEPSEEK_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-20241022";
const PROVIDER_TIMEOUT_MS = 6000;
const MAX_BODY_CHARS = 900;

export interface GuruResponse {
  answer: string;
  spokenText: string;
  sources: string[];
  validationStatus: string;
  statusLabel: string;
  tradition: string;
  safetyAdvisory?: string;
  relatedLinks: { title: string; href: string; type: "lesson" | "mudra" | "curriculum" }[];
}

/** Strips markdown formatting for clean vocal narration */
export function cleanSpokenText(markdown: string): string {
  return markdown
    .replace(/^>\s*⚠️.*$/gm, "") // remove callout warnings from speech
    .replace(/^>\s*ℹ️.*$/gm, "") // remove notice callouts from speech
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // clean links
    .replace(/[*_#`~>]/g, "") // clean markdown symbols
    .replace(/\n+/g, " ") // single space lines
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Programmatic Grounding Guard.
 *
 * Enforces validation boundaries, out-of-scope constraints, in-production
 * disclaimer requirements, and output length bounds regardless of LLM generation.
 */
export function applyValidationGroundingGuard(
  rawAnswer: string,
  context: RetrievedContext
): { answer: string; spokenText: string } {
  // 1. Out of Scope Guard: strictly enforce refusal; never allow hallucinated answers
  if (context.isOutOfScope) {
    if (
      rawAnswer &&
      (rawAnswer.includes("outside") ||
        rawAnswer.includes("पाठ्यक्रम") ||
        rawAnswer.includes("பாடத்திட்டத்திற்கு") ||
        rawAnswer.includes("పరిధికి"))
    ) {
      return { answer: rawAnswer, spokenText: rawAnswer };
    }
    const text =
      "As your 3D Virtual Guru, my teachings are strictly grounded in classical Bharatanatyam according to the Natya Shastra and Abhinaya Darpana. The topic you asked about is outside our current beginner curriculum. You can ask me about foundational stances like Aramandi, adavus like Tatta or Natta Adavu, hand mudras, or rhythmic tala cycles.";
    return { answer: text, spokenText: text };
  }

  let answer = rawAnswer;

  // 2. Strip false availability claims if hallucinated by LLM
  const isInProduction =
    context.validationStatus === "in-production" ||
    context.matchedLessons.some((l) => l.slug === "natta-adavu") ||
    /natta adavu|nattadavu/i.test(context.query);

  if (isInProduction) {
    answer = answer.replace(
      /(watch|view|inspect|practice with) the 3D guru (demonstrate|perform|show)[^.]*\./gi,
      "The theoretical movements and syllables are outlined below."
    );
    answer = answer.replace(
      /(available|ready) in (our|the) 3D (lesson|motion) player[^.]*\./gi,
      "currently awaiting studio 3D recording."
    );
  }

  // 3. Body Output Length Capping: truncate main body before mandatory disclaimers
  if (answer.length > MAX_BODY_CHARS) {
    const cut = answer.slice(0, MAX_BODY_CHARS);
    const lastPunctuation = Math.max(
      cut.lastIndexOf(". "),
      cut.lastIndexOf(".\n"),
      cut.lastIndexOf("! "),
      cut.lastIndexOf("?\n"),
      cut.lastIndexOf("\n\n")
    );
    if (lastPunctuation > 300) {
      answer = cut.slice(0, lastPunctuation + 1).trim();
    } else {
      answer = cut.trim() + "...";
    }
  }

  // 4. In-Production Guard: strictly enforce Mocap In Production notice
  if (isInProduction) {
    const noticeKeyword = "in production awaiting Natyacharya";
    if (!answer.includes(noticeKeyword)) {
      answer +=
        "\n\n> ℹ️ **Status Notice**: 3D motion capture demonstration for this lesson is currently in studio production awaiting Natyacharya recording. Theoretical concepts, sollukattu syllables, and technique cues are provided for study.";
    }
  }

  // 5. Guru-Review-Required Guard: enforce provisional safety advisory
  if (context.validationStatus === "guru-review-required") {
    const advisoryPresent =
      answer.includes("Guru Review Pending") ||
      answer.includes("Pedagogical Advisory") ||
      answer.includes("Turnout must originate");

    if (!advisoryPresent) {
      const advisory =
        context.safetyAdvisory ||
        "Turnout and joint alignment must always respect your individual anatomy. Never force physical postures without teacher guidance.";
      answer += `\n\n> ⚠️ **Pedagogical Advisory (Guru Review Pending)**: ${advisory}`;
    }
  }

  const spokenText = cleanSpokenText(answer);
  return { answer, spokenText };
}

/**
 * Deterministic grounded response generator when no external LLM key is configured
 * or when offline / running automated test suites.
 */
export function synthesizeDeterministicGroundedAnswer(
  context: RetrievedContext,
  _history: { role: "user" | "guru"; text: string }[] = [],
  lang: string = "en"
): { answer: string; spokenText: string } {
  const normLang = lang.toLowerCase().trim();
  const q = context.query.toLowerCase().trim();

  // Case 1: Out of scope
  if (context.isOutOfScope) {
    let text = "As your 3D Virtual Guru, my teachings are strictly grounded in classical Bharatanatyam according to the Natya Shastra and Abhinaya Darpana. The topic you asked about is outside our current beginner curriculum. You can ask me about foundational stances like Aramandi, adavus like Tatta or Natta Adavu, hand mudras, or rhythmic tala cycles.";
    if (normLang === "hi") {
      text = "आपके 3D Virtual Guru के रूप में, मेरी शिक्षाएं नाट्यशास्त्र और अभिनय दर्पण के अनुसार शास्त्रीय भरतनाट्यम पर आधारित हैं। आपका पूछा गया विषय हमारे शुरुआती पाठ्यक्रम से बाहर है। आप मुझसे Aramandi जैसी मूल स्थिति, Tatta या Natta Adavu, हस्त मुद्राओं (Mudras), या ताल चक्रों के बारे में पूछ सकते हैं।";
    } else if (normLang === "ta") {
      text = "உங்கள் 3D Virtual Guru-வாக, எனது கற்பித்தல் பாரம்பரிய பரதநாட்டியத்தில் நாட்டிய சாஸ்திரம் மற்றும் அபிநய தர்ப்பணம் ஆகியவற்றின் அடிப்படையில் அமைந்தது. நீங்கள் கேட்ட தலைப்பு எங்களது தொடக்க நிலை பாடத்திட்டத்திற்கு அப்பாற்பட்டது. நீங்கள் என்னிடம் Aramandi போன்ற அடிப்படை நிலைகள், Tatta Adavu அல்லது Natta Adavu, கை முத்திரைகள் (Mudras) அல்லது தாள சுழற்சிகள் பற்றி கேட்கலாம்.";
    } else if (normLang === "te") {
      text = "మీ 3D Virtual Guru గా, నా బోధనలు నాట్యశాస్త్రం మరియు అభినయ దర్పణం ప్రకారం సాంప్రదాయ భరతనాట్యంపై మాత్రమే ఆధారపడి ఉన్నాయి. మీరు అడిగిన అంశం మా ప్రారంభ స్థాయి సిలబస్ పరిధికి వెలుపల ఉంది. మీరు నన్ను Aramandi వంటి ప్రాథమిక స్థితులు, Tatta లేదా Natta Adavu, హస్త ముద్రలు లేదా తాళ చక్రాల గురించి అడగవచ్చు.";
    }
    return { answer: text, spokenText: text };
  }

  // Case 2: Observation guidance ("What should I observe in this movement?", "what to look for", "focus")
  if (context.currentStep && /observe|focus|look for|attention/i.test(q)) {
    const s = context.currentStep;
    const cuesText = s.cues && s.cues.length > 0 ? s.cues.map((c) => `• ${c}`).join("\n") : "• Maintain spinal alignment and centered breathing.";
    const text = `**Key Observations for Step ${s.index + 1} (${s.name})**\n\nWhen observing the 3D Guru in this step, pay close attention to:\n${cuesText}\n\n• **Camera Suggestion**: Switch to the **Side Profile View** to observe hip turnout and knee tracking over toes, or use the **3/4 View** for overall geometric balance.`;
    return applyValidationGroundingGuard(text, context);
  }

  // Case 3: Hand positioning during movement ("Why are the hands positioned this way?", "hands", "hastas")
  if (context.currentStep && /hands?|fingers?|palm|hastas?|arm/i.test(q)) {
    const s = context.currentStep;
    const handCue = s.cues?.find((c) => /hand|finger|anjali|kataka|pataka|waist|hastha/i.test(c));
    const text = `**Hand Alignment in Step ${s.index + 1} (${s.name})**\n\n${handCue ? `• **Core Cue**: ${handCue}\n` : ""}• **Pedagogical Purpose**: In classical Bharatanatyam, the Hastas (hand gestures) convey dramatic meaning (Abhinaya) and anchor bodily balance. During ${s.name}, keep your wrists active without dropping the elbows.\n${s.gloss ? `• **Step Context**: ${s.gloss}\n` : ""}\n*Tip*: You can zoom in on the hands using the **Mudras** camera button, or open our 3D Mudra Library to study individual hand configurations.`;
    return applyValidationGroundingGuard(text, context);
  }

  // Case 4: Active movement step inquiry during 3D demonstration
  if (context.currentStep && /this step|current step|this movement|what step|explain step|tell me about this step/i.test(q)) {
    const s = context.currentStep;
    const cuesText = s.cues && s.cues.length > 0 ? s.cues.map((c) => `• ${c}`).join("\n") : "• Maintain an upright spine and balanced Aramandi.";
    let text = `**Step ${s.index + 1}: ${s.name}**\n\n${s.gloss || "A key movement in this choreographic sequence."}\n\n**Alignment & Technique Cues**:\n${cuesText}\n\n*Guru Advice*: Use the 3D playback controls to pause and rotate the Guru from Front to Side View to inspect the exact angle of this movement before practicing.`;

    if (normLang === "hi") {
      text = `**चरण ${s.index + 1}: ${s.name}**\n\n${s.gloss || "इस नृत्य अनुक्रम का एक महत्वपूर्ण चरण।"}\n\n**संरेखण और तकनीक निर्देश (Technique Cues)**:\n${cuesText}\n\n*गुरु सलाह*: 3D कंट्रोल्स का उपयोग करके गुरु को फ्रंट से साइड व्यू में घुमाएं और अभ्यास से पहले सटीक कोण को समझें।`;
    } else if (normLang === "ta") {
      text = `**படிநிலை ${s.index + 1}: ${s.name}**\n\n${s.gloss || "இந்த வரிசையின் முக்கியமான படிநிலை இயக்கம்."}\n\n**தொழில்நுட்ப வழிகாட்டுதல்கள் (Technique Cues)**:\n${cuesText}\n\n*குரு அறிவுரை*: பயிற்சி செய்வதற்கு முன் இயக்கத்தின் சரியான கோணத்தை அறிய 3D குருவை முன்பக்கத்திலிருந்து பக்கவாட்டு தோற்றத்திற்கு (Side View) சுழற்றிப் பாருங்கள்.`;
    } else if (normLang === "te") {
      text = `**దశ ${s.index + 1}: ${s.name}**\n\n${s.gloss || "ఈ నాట్య క్రమంలో ఒక కీలకమైన కదలిక."}\n\n**సాంకేతిక సూచనలు (Technique Cues)**:\n${cuesText}\n\n*గురు సలహా*: అభ్యాసానికి ముందు భంగిమ కోణాన్ని పరిశీలించడానికి 3D నియంత్రణలను ఉపయోగించి గురువును ఫ్రంట్ నుండి సైడ్ వ్యూకి తిప్పండి.`;
    }
    return applyValidationGroundingGuard(text, context);
  }

  // Case 5: Rhythm inquiry ("Can you explain the rhythm?", "rhythm", "tala", "sollukattu")
  if (/rhythm|tala|tempo|kalam|speed|beat|sollukattu|syllables/i.test(q)) {
    const lesson = context.currentLesson || context.matchedLessons[0];
    if (lesson?.slug === "thattadavu" || q.includes("thattadavu") || q.includes("tatta")) {
      const text = `**Rhythm in Thattadavu (Adi Tala)**\n\n• **Sollukattu (Syllables)**: *"Tai Ya Tai Hi, Tai Ya Tai Hi"*\n• **Tala Structure**: 8-beat Adi Tala (Chaturashra Jaati Triputa Tala: 1 Laghu of 4 counts + 2 Dhrutams of 2 counts each).\n• **Three Kalams (Tempos)**:\n  1. *Prathama Kalam* (1x speed: 1 strike per count)\n  2. *Dvitheeya Kalam* (2x speed: 2 strikes per count)\n  3. *Thritheeya Kalam* (4x speed: 4 strikes per count)\n\nMaintain constant Aramandi depth throughout all three speeds without letting your torso bounce.`;
      return applyValidationGroundingGuard(text, context);
    }
    const text = `**Rhythmic Foundation**\n\n• The choreography follows a disciplined Carnatic tala cycle, synchronizing sole strikes, hand extensions, and breathing.\n• In the 3D player, you can select **0.5x** or **0.75x** playback speed to absorb the cadence slowly before progressing to full tempo (1x).`;
    return applyValidationGroundingGuard(text, context);
  }

  // Case 6: Follow-up / Simplification request ("explain simply", "slower", "again")
  if (/simply|simple|more slowly|slower|did not understand|again|repeat/i.test(q)) {
    const lesson = context.currentLesson || context.matchedLessons[0];
    const mudra = context.matchedMudras[0];

    if (mudra) {
      const text = `Let me break down **${mudra.name} Hasta** simply for you:
1. **The Shape**: ${mudra.instructions || "Hold your hand upright with steady fingers."}
2. **What to avoid**: ${mudra.commonMistakes || "Keep your fingers energized and avoid drooping."}
3. **Core meaning**: It means "${mudra.meaning}". In traditional dance, we use it to show ${mudra.meaningLong || "sacred and natural elements"}.

Take your time and inspect the 3D hand in the library to see the exact finger angles!`;
      return applyValidationGroundingGuard(text, context);
    }

    if (lesson) {
      const cue = lesson.techniqueCues[0] || "Maintain a vertical spine and centered breathing.";
      const mistake = lesson.commonMistakes[0]?.correction || "Focus on balance before attempting speed.";
      const text = `Let us make **${lesson.title}** very simple:
- **Core Posture**: ${lesson.subtitle}
- **Key Cue**: ${cue}
- **Helpful Tip**: ${mistake}
- **Guru's Advice**: "${lesson.guruNote}"

Remember: Bharatanatyam is mastered through patience (Abhyasa). Do not rush into speed until your stance feels completely steady.`;
      return applyValidationGroundingGuard(text, context);
    }
  }

  // Case 7: "What next?" / Progression request
  if (/what next|after this|continue|next lesson|progression/i.test(q)) {
    const lesson = context.currentLesson || context.matchedLessons[0];
    if (lesson?.nextLessonSlug) {
      const nextTitle = lesson.nextLessonSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const text = `Following our progressive curriculum, after **${lesson.title}**, your next recommended step is **${nextTitle}**.
- We progress from sacred preparation to foundational stances, then adavu footwork, followed by rhythm and mudras.
- Whenever you feel confident in your current posture, proceed to the next module!`;
      return applyValidationGroundingGuard(text, context);
    }
    const text =
      "In our six-level curriculum, we follow a progressive path: Level 1 (Introduction & Sacred Space), Level 2 (Samapada & Aramandi), Level 3 (Namaskaram & Adavus), Level 4 (Adi Tala & Rhythm), Level 5 (Mudra Knowledge), and Level 6 (Revision). Which level would you like to explore?";
    return applyValidationGroundingGuard(text, context);
  }

  // Case 8: Mudra Question (e.g. "Explain Pataka Hasta")
  if (context.matchedMudras.length > 0) {
    const m = context.matchedMudras[0];
    let text = `**${m.name} Hasta (${m.category})**
- **Meaning**: "${m.meaning}" — ${m.meaningLong || "A foundational gesture in Bharatanatyam."}
- **Formation Instructions**: ${m.instructions || "Keep fingers straight and thumb bent slightly."}
- **Classical Viniyoga (Usage)**: ${m.significance || "Used across multiple dramatic contexts in classical choreography."}
- **Common Alignment Error**: ${m.commonMistakes || "Gaps between fingers or bent fingertips."}

*Note: In the NrityaVaani 3D Mudra Library, this gesture is part of our verified 28-mudra digital collection (18 single-hand and 10 combined-hand mudras).*`;

    if (normLang === "hi") {
      text = `**${m.name} Hasta (${m.category})**
- **अर्थ**: "${m.meaning}" — भरतनाट्यम का आधारभूत हस्त।
- **बनाने की विधि**: ${m.instructions || "उंगलियों को सीधा और आपस में सटाकर रखें, अंगूठे को थोड़ा मोड़ें।"}
- **शास्त्रीय विनियोग**: ${m.significance || "शास्त्रीय नृत्यों में आशीर्वाद, वन, बादल और शांति दर्शाने के लिए प्रयुक्त।"}
- **सामान्य त्रुटि**: ${m.commonMistakes || "उंगलियों के बीच खाली जगह छोड़ना या पोरों का ढीला होना।"}

*नोट: NrityaVaani 3D मुद्रा लाइब्रेरी में यह हस्त हमारे 28 डिजिटल मॉडलों में शामिल है।*`;
    } else if (normLang === "ta") {
      text = `**${m.name} Hasta (${m.category})**
- **பொருள்**: "${m.meaning}" — பரதநாட்டியத்தின் முதன்மையான முத்திரை.
- **அமைக்கும் முறை**: ${m.instructions || "விரல்களை நேராகவும் நெருக்கமாகவும் வைக்கவும், கட்டைவிரலை வளைக்கவும்."}
- **சாஸ்திர வினியோகம்**: ${m.significance || "மேகங்கள், காடுகள், ஆசீர்வாதம் மற்றும் நதிகளைக் குறிக்கப் பயன்படுகிறது."}
- **பொதுவான தவறு**: ${m.commonMistakes || "விரல்களுக்கு இடையில் இடைவெளி விடுவது."}

*குறிப்பு: NrityaVaani 3D முத்திரை நூலகத்தில் இது சரிபார்க்கப்பட்ட 28 முத்திரைகளில் ஒன்றாகும்.*`;
    } else if (normLang === "te") {
      text = `**${m.name} Hasta (${m.category})**
- **అర్థం**: "${m.meaning}" — భరతనాట్యంలో ప్రాథమిక హస్త ముద్ర.
- **చేసే విధానం**: ${m.instructions || "వేళ్లను నిటారుగా మరియు దగ్గరగా ఉంచాలి, బొటనవేలిని కొద్దిగా వంచాలి."}
- **శాస్త్రీయ వినియోగం**: ${m.significance || "మేఘాలు, అడవులు మరియు ఆశీర్వాదాలను చూపించడానికి ఉపయోగిస్తారు."}
- **సాధారణ లోపం**: ${m.commonMistakes || "వేళ్ళ మధ్య ఖాళీలు వదలడం."}

*గమనిక: NrityaVaani 3D ముద్ర లైబ్రరీలో ఇది ధృవీకరించబడిన 28 ముద్రలలో ఒకటి.*`;
    }
    return applyValidationGroundingGuard(text, context);
  }

  // Case 9: Tatta Adavu vs Natta Adavu comparison
  if (
    (q.includes("tatta") || q.includes("thattadavu")) &&
    (q.includes("natta") || q.includes("nattadavu"))
  ) {
    let text = `**Tatta Adavu vs. Natta Adavu: The Foundational Distinction**

1. **Meaning & Movement**:
   - **Tatta Adavu** comes from *'Tattu'* (to strike flat). It consists purely of flat-sole stamps in Aramandi with hands anchored on the waist (Kati Hastha). It trains spinal stability and tempo control.
   - **Natta Adavu** comes from *'Nattu'* (to plant firmly). It introduces **heel strikes** (Kutti Thattu), alternating leg reaches, and sweeping Tripataka arm extensions coordinated with eye gaze (*Drishti Bheda*).

2. **Sollukattu (Rhythm)**:
   - Tatta Adavu uses syllables like *"Tai Ya Tai Hi"*.
   - Natta Adavu uses syllables like *"Tai Yum Tat Tat, Tai Yum Tam"*.

3. **Status in NrityaVaani**:
   - Tatta Adavu has a complete verified 3D motion take in the lesson player.
   - Natta Adavu step theory is fully documented in our curriculum, while studio 3D motion capture is currently in production awaiting Natyacharya recording.`;

    if (normLang === "hi") {
      text = `**Tatta Adavu बनाम Natta Adavu: मूल अंतर**

1. **अर्थ और गति (Movement)**:
   - **Tatta Adavu** शब्द 'तट्टु' (सपाट प्रहार) से आता है। इसमें Kati Hastha में हाथ रखकर Aramandi में सपाट तलवों से जमीन पर प्रहार किया जाता है।
   - **Natta Adavu** शब्द 'नट्टु' (मजबूती से रोपना) से आता है। इसमें एड़ी के प्रहार (Kutti Thattu) और Drishti Bheda के साथ Tripataka हस्त मुद्राओं का विस्तार होता है।

2. **Sollukattu (लय के बोल)**:
   - Tatta Adavu के बोल हैं: *"Tai Ya Tai Hi"*।
   - Natta Adavu के बोल हैं: *"Tai Yum Tat Tat, Tai Yum Tam"*।

3. **NrityaVaani में स्थिति**:
   - Tatta Adavu का पूर्ण 3D मोशन टेक उपलब्ध है।
   - Natta Adavu के सिद्धांत पाठ्यक्रम में उपलब्ध हैं, जबकि 3D मोशन कैप्चर वर्तमान में स्टूडियो रिकॉर्डिंग के अधीन है।`;
    } else if (normLang === "ta") {
      text = `**Tatta Adavu மற்றும் Natta Adavu: அடிப்படை வேறுபாடு**

1. **பொருள் மற்றும் இயக்கம் (Movement)**:
   - **Tatta Adavu** என்பது 'தட்டு' (தட்டையாக அடித்தல்) என்பதிலிருந்து வந்தது. Kati Hastha நிலையில் கைகளை இடுப்பில் வைத்து Aramandi-யில் பாதங்களை தட்டுவதை அடிப்படையாகக் கொண்டது.
   - **Natta Adavu** என்பது 'நாட்டு' என்பதிலிருந்து உருவானது. இது குதிகால் தட்டுதல் (Kutti Thattu) மற்றும் Tripataka முத்திரைகளுடன் Drishti Bheda பார்வையை ஒருங்கிணைக்கிறது.

2. **Sollukattu (சொல்லுகட்டு)**:
   - Tatta Adavu சொல்லுகட்டு: *"Tai Ya Tai Hi"*.
   - Natta Adavu சொல்லுகட்டு: *"Tai Yum Tat Tat, Tai Yum Tam"*.

3. **NrityaVaani நிலை**:
   - Tatta Adavu முழுமையான 3D இயக்கப் பதிவைக் கொண்டுள்ளது.
   - Natta Adavu கோட்பாடு உள்ளது; 3D மோஷன் கேப்சர் தற்போது ஸ்டுடியோ தயாரிப்பில் உள்ளது.`;
    } else if (normLang === "te") {
      text = `**Tatta Adavu మరియు Natta Adavu: ప్రాథమిక భేదం**

1. **అర్థం మరియు కదలిక (Movement)**:
   - **Tatta Adavu** 'తట్టు' (ఫ్లాట్ గా కొట్టడం) నుండి వచ్చింది. Kati Hastha లో చేతులు ఉంచి Aramandi లో పాదాలను కొట్టడం నేర్పుతుంది.
   - **Natta Adavu** 'నాటు' (మడమ నాటడం) నుండి వచ్చింది. ఇది మడమ దెబ్బలు (Kutti Thattu) మరియు Tripataka హస్తాలతో Drishti Bheda దృష్టిని సమన్వయం చేస్తుంది.

2. **Sollukattu (తాళ శబ్దాలు)**:
   - Tatta Adavu శబ్దాలు: *"Tai Ya Tai Hi"*.
   - Natta Adavu శబ్దాలు: *"Tai Yum Tat Tat, Tai Yum Tam"*.

3. **NrityaVaani లో స్థితి**:
   - Tatta Adavu కి పూర్తి 3D మోషన్ అందుబాటులో ఉంది.
   - Natta Adavu సిలబస్ లో ఉంది; 3D మోషన్ కాప్చర్ ప్రస్తుతం స్టూడియో రికార్డింగ్ దశలో ఉంది.`;
    }
    return applyValidationGroundingGuard(text, context);
  }

  // Case 10: Aramandi inquiry
  if (q.includes("aramandi") || q.includes("ayata") || q.includes("turnout")) {
    let text = `**Aramandi (Ayata Mandala): The Core Diamond Stance**

Aramandi is the foundational half-sitting posture of Bharatanatyam:
- **Geometry**: The knees flex outward sideways forming a distinct diamond silhouette, while the torso and spine remain upright.
- **Safe Turnout**: Turnout must originate from the **natural external rotation of the hip joints**, not forced at the knees or ankles. Never force a 180° foot position through pain.
- **Tradition Nuance**: Kalakshetra typically teaches heels approximately two to three fingers' width apart with strict geometric alignment, while older Tanjavur styles often position heels closer or touching.
- **Common Error**: Letting knees cave inward or leaning forward from the hips. Engage your outer hip muscles to hold the knees open over your toes.`;

    if (normLang === "hi") {
      text = `**Aramandi (Ayata Mandala): मूल अर्ध-बैठक स्थिति**

Aramandi भरतनाट्यम की आधारभूत अर्ध-बैठक मुद्रा है:
- **संरचना (Geometry)**: घुटने बाहर की ओर मुड़ते हैं जिससे शरीर का निचला हिस्सा एक स्पष्ट हीरे (diamond) जैसा आकार लेता है, जबकि रीढ़ सीधी रहती है।
- **सुरक्षित टर्नआउट (Safe Turnout)**: टर्नआउट कूल्हों (hip joints) के स्वाभाविक बाहरी घुमाव से आना चाहिए, घुटनों या टखनों पर अनुचित दबाव न डालें।
- **परंपरागत अंतर (Tradition Nuance)**: कलाक्षेत्र शैली में एड़ियों के बीच दो से तीन उंगलियों की दूरी सिखाई जाती है, जबकि तंजावूर शैली में एड़ियां अधिक पास होती हैं।
- **सावधानी**: घुटनों को अंदर झुकने न दें। पैरों के पंजों पर संतुलन बनाए रखें।`;
    } else if (normLang === "ta") {
      text = `**Aramandi (அயத மண்டலம் / அரைமண்டி): அடிப்படை நிலை**

Aramandi என்பது பரதநாட்டியத்தின் முதன்மையான அரை-அமர்வு நிலை:
- **வடிவமைப்பு (Geometry)**: முழங்கால்கள் பக்கவாட்டில் வளைந்து ஒரு தெளிவான வைர (diamond) வடிவத்தை உருவாக்குகின்றன, அதே சமயம் முதுகுத்தண்டு நேராக நிமிர்ந்து இருக்க வேண்டும்.
- **பாதுகாப்பான திருப்பம் (Safe Turnout)**: திருப்பமானது இடுப்பு மூட்டுகளின் (hip joints) இயற்கையான சுழற்சியிலிருந்து வர வேண்டும். முழங்கால்களையோ கணுக்கால்களையோ பலவந்தமாக திருப்பக் கூடாது.
- **மரபு நுணுக்கம் (Tradition Nuance)**: கலாக்ஷேத்ரா பாணியில் குதிகால்களுக்கு இடையே இரண்டு அல்லது மூன்று விரல் இடைவெளி கற்பிக்கப்படுகிறது; தஞ்சாவூர் மரபில் குதிகால்கள் நெருக்கமாக வைக்கப்படலாம்.
- **எச்சரிக்கை**: முழங்கால்கள் உள்நோக்கி சாயாமல் பாதங்களின் விரல்களுக்கு நேராக இருப்பதை உறுதி செய்யவும்.`;
    } else if (normLang === "te") {
      text = `**Aramandi (ఆయత మండల): ప్రాథమిక స్థితి**

Aramandi భరతనాట్యంలో అత్యంత ముఖ్యమైన అర్థ-కూర్చునే భంగిమ:
- **భంగిమ నిర్మాణం (Geometry)**: మోకాళ్లు ఇరువైపులా వంగి స్పష్టమైన వజ్రం (diamond) ఆకారాన్ని ఏర్పరుస్తాయి, అలాగే వెన్నెముక నిటారుగా స్థిరంగా ఉండాలి.
- **సురక్షితమైన టర్నౌట్ (Safe Turnout)**: ఈ టర్నౌట్ తుంటి భాగం (hip joints) యొక్క సహజ భ్రమణం ద్వారా మాత్రమే రావాలి. మోకాళ్లు లేదా చీలమండలపై బలవంతపు ఒత్తిడి తీసుకురావద్దు.
- **సంప్రదాయ భేదం (Tradition Nuance)**: కళాక్షేత్ర శైలిలో మడమల మధ్య రెండు లేదా మూడు వేళ్ళ దూరం నేర్పిస్తారు, తంజావూరు పద్ధతిలో మడమలు దగ్గరగా ఉంటాయి.
- **సాధారణ పొరపాటు**: మోకాళ్లు లోపలికి వాలకుండా జాగ్రత్త వహించండి.`;
    }
    return applyValidationGroundingGuard(text, context);
  }

  // Case 11: Namaskaram inquiry
  if (q.includes("namaskaram") || q.includes("bhumi pranam") || q.includes("why do we perform namaskaram")) {
    const text = `**Namaskaram (Bhumi Pranam): Sacred Salutation**

We perform Namaskaram before and after every dance session for three profound reasons:
1. **Guru & Divine Reverence**: Reciting the Guru Vandana (*"Guru Brahma, Guru Vishnu..."*) honors the unbroken lineage transmission and invokes divine grace.
2. **Bhumi Devi Pranam**: Stamping vigorously during adavus strikes Mother Earth. In Namaskaram, we touch the earth and bring our fingertips to our eyes, asking Mother Earth's forgiveness and blessing before dancing.
3. **Sabha Vandana**: We extend respect to the teachers, musicians, and assembly who witness and guide our sadhana.

In our Level 3 lesson player, you can study all 11 sequential steps with full 3D motion demonstration.`;
    return applyValidationGroundingGuard(text, context);
  }

  // Case 12: Generic Lesson Match
  const lesson = context.matchedLessons[0];
  if (lesson) {
    const conceptText = lesson.keyConcepts.map((k) => `• **${k.title}**: ${k.explanation}`).join("\n");
    const cueText = lesson.techniqueCues.slice(0, 2).map((c) => `• ${c}`).join("\n");
    const text = `**${lesson.title}**

${lesson.description}

**Key Concepts**:
${conceptText}

**Technique Cues**:
${cueText}

*Guru Note*: "${lesson.guruNote}"
${lesson.traditionNotes ? `\n*Lineage Context*: ${lesson.traditionNotes}` : ""}`;
    return applyValidationGroundingGuard(text, context);
  }

  // Fallback default
  const defaultText =
    "Welcome, dear student. I am your 3D Virtual Guru. You can ask me any question about our Bharatanatyam curriculum, such as 'What is Aramandi?', 'Explain Pataka Hasta', 'How is Tatta Adavu different from Natta Adavu?', or 'Why do we perform Namaskaram?'. How can I guide your practice today?";
  return applyValidationGroundingGuard(defaultText, context);
}

/**
 * Main synthesis entrypoint: calls LLM (DeepSeek or Claude) if key is configured,
 * with strict timeout, rate-limit resilience, and error masking.
 * Seamlessly falls back to deterministic grounded synthesizer on any provider issue.
 */
export async function synthesizeGuruAnswer(
  context: RetrievedContext,
  history: { role: "user" | "guru"; text: string }[] = [],
  apiKey?: string,
  preferredProvider?: "deepseek" | "claude",
  lang: string = "en"
): Promise<GuruResponse> {
  const sources: string[] = [];
  if (context.primaryProvenance) {
    sources.push(context.primaryProvenance.sourceText);
  }
  for (const l of context.matchedLessons) {
    if (!sources.includes(l.title)) sources.push(l.title);
  }
  for (const m of context.matchedMudras) {
    sources.push(`${m.name} Hasta (${m.category})`);
  }
  if (context.currentStep) {
    sources.push(`Demonstrated Step ${context.currentStep.index + 1}: ${context.currentStep.name}`);
  }

  // Detect keys and determine provider
  const deepseekKey = (preferredProvider !== "claude" && (apiKey || process.env.DEEPSEEK_API_KEY)) || undefined;
  const claudeKey = (preferredProvider === "claude" && (apiKey || process.env.ANTHROPIC_API_KEY)) ||
    (!deepseekKey && process.env.ANTHROPIC_API_KEY) || undefined;

  // Immediate deterministic fallback if offline, test mode, or no key configured
  if ((!deepseekKey && !claudeKey) || context.isOutOfScope) {
    const { answer, spokenText } = synthesizeDeterministicGroundedAnswer(context, history, lang);
    return {
      answer,
      spokenText,
      sources,
      validationStatus: context.validationStatus,
      statusLabel: context.statusLabel,
      tradition: context.tradition,
      safetyAdvisory: context.safetyAdvisory,
      relatedLinks: context.relatedLinks,
    };
  }

  const promptKnowledge = `
RETRIEVED KNOWLEDGE BASE:
${context.matchedMudras.map((m) => `MUDRA: ${m.name} (${m.category}) | Meaning: ${m.meaning} | Details: ${m.meaningLong} | Instructions: ${m.instructions} | Common Mistakes: ${m.commonMistakes}`).join("\n")}
${context.matchedLessons.map((l) => `LESSON: ${l.title} (${l.levelName}) | Desc: ${l.description} | Concepts: ${l.keyConcepts.map((c) => `${c.title}: ${c.explanation}`).join("; ")} | Cues: ${l.techniqueCues.join("; ")} | Tradition: ${l.traditionNotes || "Pan-Bharatanatyam"}`).join("\n")}
${context.currentStep ? `ACTIVE MOVEMENT STEP: Step ${context.currentStep.index + 1} (${context.currentStep.name}) | Explanation: ${context.currentStep.gloss || 'None'} | Cues: ${context.currentStep.cues?.join('; ') || 'Standard alignment cues'}` : ""}
PROVENANCE & STATUS: ${context.statusLabel} (${context.tradition})
SAFETY ADVISORY: ${context.safetyAdvisory || "Practice mindfully within anatomical comfort."}
CURRENT LESSON CONTEXT: ${context.currentLesson ? context.currentLesson.title : "None (General Inquiry)"}
`;

  const targetLangConfig = getLanguageConfig(lang);
  const systemPrompt = `You are the patient, encouraging 3D Virtual Guru of NrityaVaani, teaching classical Bharatanatyam to beginners.
CRITICAL PEDAGOGICAL & LANGUAGE RULES:
1. RESPOND IN THE REQUESTED LANGUAGE: ${targetLangConfig.name} (${targetLangConfig.nativeName}).
2. PRESERVE SACRED CLASSICAL TERMINOLOGY: Never translate or Anglicize core terms: Aramandi, Samapada, Muzhumandi, Natyarambha, Pataka, Tripataka, Asamyukta Hasta, Samyukta Hasta, Sollukattu, Adi Tala, Nritta, Nritya, Natya, Tatta Adavu, Natta Adavu. Always keep the Sanskrit or Tamil term intact and explain it naturally in ${targetLangConfig.nativeName}.
3. ONLY use verified facts from the RETRIEVED KNOWLEDGE BASE. Do not invent Sanskrit verses, viniyogas, or historical claims.
4. If the user asks about Natta Adavu, note that 3D motion capture is in production awaiting Natyacharya recording, but theory and cues are available.
5. If the user asks about Aramandi, emphasize that turnout must come from hip rotation, not forced at knees/ankles.
6. If the user asks about the active step or movement, answer using the ACTIVE MOVEMENT STEP cues and gloss.
7. Do not claim the ability to visually observe the learner's physical room or webcam.
8. Maintain dark-mode friendly Markdown formatting: bold headings (**Topic**), bullet points (• or -), and short paragraphs.`;

  // Attempt external provider call with strict timeout
  try {
    let rawAnswer: string | null = null;

    if (deepseekKey) {
      const client = new OpenAI({
        apiKey: deepseekKey,
        baseURL: DEEPSEEK_URL,
        timeout: PROVIDER_TIMEOUT_MS,
      });

      const completion = await client.chat.completions.create({
        model: DEEPSEEK_MODEL,
        max_tokens: 600,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          ...history.slice(-4).map((h) => ({
            role: h.role === "guru" ? ("assistant" as const) : ("user" as const),
            content: h.text,
          })),
          {
            role: "user",
            content: `${promptKnowledge}\n\nUSER QUESTION: "${context.query}"`,
          },
        ],
      });

      rawAnswer = completion.choices[0]?.message?.content?.trim() || null;
    } else if (claudeKey) {
      const anthropic = new Anthropic({
        apiKey: claudeKey,
        timeout: PROVIDER_TIMEOUT_MS,
      });

      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 600,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          ...history.slice(-4).map((h) => ({
            role: h.role === "guru" ? ("assistant" as const) : ("user" as const),
            content: h.text,
          })),
          {
            role: "user",
            content: `${promptKnowledge}\n\nUSER QUESTION: "${context.query}"`,
          },
        ],
      });

      const firstBlock = message.content[0];
      if (firstBlock && firstBlock.type === "text") {
        rawAnswer = firstBlock.text.trim();
      }
    }

    if (rawAnswer && rawAnswer.length > 0) {
      const { answer, spokenText } = applyValidationGroundingGuard(rawAnswer, context);
      return {
        answer,
        spokenText,
        sources,
        validationStatus: context.validationStatus,
        statusLabel: context.statusLabel,
        tradition: context.tradition,
        safetyAdvisory: context.safetyAdvisory,
        relatedLinks: context.relatedLinks,
      };
    }
  } catch (err: unknown) {
    // Safe error masking: log warning internally without exposing API keys or tokens
    const errMsg = err instanceof Error ? err.message : "Provider failure";
    console.warn(`[GuruSynthesizer] Provider call failed (${errMsg.slice(0, 100)}). Falling back to grounded rule base.`);
  }

  // Graceful, predictable fallback on any error, timeout, or rate limit
  const { answer, spokenText } = synthesizeDeterministicGroundedAnswer(context, history, lang);
  return {
    answer,
    spokenText,
    sources,
    validationStatus: context.validationStatus,
    statusLabel: context.statusLabel,
    tradition: context.tradition,
    safetyAdvisory: context.safetyAdvisory,
    relatedLinks: context.relatedLinks,
  };
}
