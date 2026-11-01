/**
 * Dynamic Lesson-Specific and Chapter-Specific Question Suggestions.
 *
 * Provides tailored prompt suggestions for the 3D Virtual Guru based on
 * the active curriculum lesson, chapter, step, and learner's language.
 */

export function getLessonSpecificSuggestions(
  slug?: string,
  _chapterIndex?: number,
  stepName?: string,
  lang: string = "en"
): string[] {
  if (stepName) {
    return [
      "Explain this step",
      "Why are the hands positioned this way?",
      "Can you explain the rhythm?",
      "What should I observe in this movement?",
      "Explain this movement simply.",
    ];
  }

  const s = slug?.toLowerCase() || "";

  if (s.includes("intro")) {
    if (lang === "hi") return ["Nritta और Nritya में क्या अंतर है?", "नाट्यशास्त्र का क्या महत्व है?", "Natya क्या है?"];
    if (lang === "ta") return ["Nritta மற்றும் Nritya இடையே உள்ள வேறுபாடு என்ன?", "நாட்டிய சாஸ்திரத்தின் தோற்றம் என்ன?"];
    if (lang === "te") return ["Nritta మరియు Nritya మధ్య తేడా ఏమిటి?", "నాట్యశాస్త్రం ప్రాముఖ్యత ఏమిటి?"];
    return [
      "What is the difference between Nritta and Nritya?",
      "Explain the spiritual roots in Natya Shastra.",
      "What is Natya?",
      "How does the Guru-Shishya tradition guide practice?",
    ];
  }

  if (s.includes("aramandi") || s.includes("samapada")) {
    if (lang === "hi") return ["Aramandi में घुटनों का सुरक्षित संरेखण कैसे रखें?", "टर्नआउट कहाँ से आना चाहिए?", "कलाक्षेत्र और तंजावूर शैली में क्या अंतर है?"];
    if (lang === "ta") return ["Aramandi-யில் முழங்கால்களை பாதுகாப்பது எப்படி?", "திருப்பம் எங்கிருந்து வர வேண்டும்?"];
    if (lang === "te") return ["Aramandi లో మోకాళ్లను ఎలా రక్షించుకోవాలి?", "టర్నౌట్ ఎక్కడి నుండి రావాలి?"];
    return [
      "How to protect knees in Aramandi?",
      "Where should turnout originate from?",
      "What is the Kalakshetra vs Tanjavur variation?",
      "What is Samapada?",
    ];
  }

  if (s.includes("mudra") || s.includes("hasta") || s.includes("pataka") || s.includes("hand")) {
    if (lang === "hi") return ["Pataka Hasta कैसे बनाया जाता है?", "Pataka के मुख्य विनियोग क्या हैं?", "हस्त मुद्रा बनाते समय क्या गलतियाँ न करें?"];
    if (lang === "ta") return ["Pataka Hasta அமைப்பது எப்படி?", "Pataka முத்திரையின் பயன்பாடுகள் என்ன?"];
    return [
      "Explain Pataka Hasta formation.",
      "What are the verified viniyogas of Pataka?",
      "How many Asamyukta Hastas are in Abhinaya Darpana?",
      "Common alignment mistakes in Pataka Hasta.",
    ];
  }

  if (s.includes("namaskaram")) {
    if (lang === "hi") return ["Namaskaram क्यों करते हैं?", "Bhumi Pranam के 11 चरण क्या हैं?", "धरती को छूने का क्या महत्व है?"];
    return [
      "Why do we perform Namaskaram?",
      "What are the 11 steps of Bhumi Pranam?",
      "What does touching the earth symbolize?",
      "What is Anjali Mudra?",
    ];
  }

  if (s.includes("thattadavu") || s.includes("tatta")) {
    if (lang === "hi") return ["Thattadavu के तीन काल (Speeds) समझाइए", "Tai Ya Tai Hi का क्या अर्थ है?", "Aramandi में शरीर उछलने से कैसे रोकें?"];
    return [
      "Explain the 3 Kalams in Thattadavu.",
      "What does Tai Ya Tai Hi mean?",
      "How to keep pelvis stable during stamps?",
      "What is Kati Hastha?",
    ];
  }

  if (s.includes("natta")) {
    if (lang === "hi") return ["Natta Adavu और Tatta Adavu में क्या अंतर है?", "Kutti Thattu एड़ी का प्रहार क्या है?", "Tripataka हस्त मुद्रा का संरेखण कैसे करें?"];
    return [
      "How is Natta Adavu different from Tatta Adavu?",
      "What are Kutti Thattu heel strikes?",
      "Explain Tripataka arms in Natta Adavu.",
      "What is the studio mocap status for Natta Adavu?",
    ];
  }

  if (s.includes("tala") || s.includes("rhythm") || s.includes("sollukattu")) {
    return [
      "Explain the 8 beats of Adi Tala.",
      "What is a Laghu and Dhrutam?",
      "How to count beats on fingers?",
      "What are the three Kalams of speed?",
    ];
  }

  return [
    "Explain this lesson concept simply.",
    "What are the primary technique cues?",
    "What common mistakes should I avoid?",
    "What should I observe in the demonstration?",
  ];
}
