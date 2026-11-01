/**
 * Comprehensive Indian Regional Language Catalog for NrityaVaani 3D Virtual Guru.
 *
 * Grounded in verified capabilities:
 * - 14 target languages with authentic native script displays.
 * - Explicit distinction between Full Neural Voice vs Text-Only languages.
 * - Preservation guidelines for Bharatanatyam classical terminology.
 */

export interface RegionalVoiceConfig {
  femaleVoice: string;
  maleVoice: string;
  engine: "edge-neural" | "classical-bed" | "browser-only" | "none";
  quality: "verified-high" | "verified-medium" | "unverified" | "none";
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  bcp47: string;
  script: string;
  direction: "ltr" | "rtl";
  textSupport: "full";
  voiceSupport: boolean;
  voiceConfig?: RegionalVoiceConfig;
  voiceNote?: string;
  speechRecognitionCode?: string;
}

export const INDIAN_REGIONAL_LANGUAGES: LanguageConfig[] = [
  {
    code: "en",
    name: "English (Indian)",
    nativeName: "English",
    bcp47: "en-IN",
    script: "Latin",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: true,
    voiceConfig: {
      femaleVoice: "en-IN-NeerjaNeural",
      maleVoice: "en-IN-PrabhatNeural",
      engine: "edge-neural",
      quality: "verified-high",
    },
    voiceNote: "Crisp Indian English diction with classical terminology clarity.",
    speechRecognitionCode: "en-IN",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिंदी",
    bcp47: "hi-IN",
    script: "Devanagari",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: true,
    voiceConfig: {
      femaleVoice: "hi-IN-SwaraNeural",
      maleVoice: "hi-IN-MadhurNeural",
      engine: "edge-neural",
      quality: "verified-high",
    },
    voiceNote: "Expressive classical cadence for shlokas, cues, and abhinaya.",
    speechRecognitionCode: "hi-IN",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    bcp47: "ta-IN",
    script: "Tamil",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: true,
    voiceConfig: {
      femaleVoice: "ta-IN-PallaviNeural",
      maleVoice: "ta-IN-ValluvarNeural",
      engine: "edge-neural",
      quality: "verified-high",
    },
    voiceNote: "Authentic classical Tamil pronunciation matching Bharatanatyam roots.",
    speechRecognitionCode: "ta-IN",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    bcp47: "te-IN",
    script: "Telugu",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: true,
    voiceConfig: {
      femaleVoice: "te-IN-ShrutiNeural",
      maleVoice: "te-IN-MohanNeural",
      engine: "edge-neural",
      quality: "verified-high",
    },
    voiceNote: "Melodic classical Telugu cadence suited for rhythm and posture guidance.",
    speechRecognitionCode: "te-IN",
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    bcp47: "kn-IN",
    script: "Kannada",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: true,
    voiceConfig: {
      femaleVoice: "kn-IN-SapnaNeural",
      maleVoice: "kn-IN-GaganNeural",
      engine: "edge-neural",
      quality: "verified-high",
    },
    voiceNote: "Clear South Indian classical cadence for movement instruction.",
    speechRecognitionCode: "kn-IN",
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    bcp47: "ml-IN",
    script: "Malayalam",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: true,
    voiceConfig: {
      femaleVoice: "ml-IN-SobhanaNeural",
      maleVoice: "ml-IN-MidhunNeural",
      engine: "edge-neural",
      quality: "verified-high",
    },
    voiceNote: "Precise phonetics resonant with Kerala classical dance traditions.",
    speechRecognitionCode: "ml-IN",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    bcp47: "bn-IN",
    script: "Bengali",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: true,
    voiceConfig: {
      femaleVoice: "bn-IN-TanishaaNeural",
      maleVoice: "bn-IN-BashkarNeural",
      engine: "edge-neural",
      quality: "verified-high",
    },
    voiceNote: "Smooth Eastern Indian cadence with natural phrasing.",
    speechRecognitionCode: "bn-IN",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    bcp47: "mr-IN",
    script: "Devanagari",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: true,
    voiceConfig: {
      femaleVoice: "mr-IN-AarohiNeural",
      maleVoice: "mr-IN-ManoharNeural",
      engine: "edge-neural",
      quality: "verified-high",
    },
    voiceNote: "Articulate western Indian delivery with clear rhythm counts.",
    speechRecognitionCode: "mr-IN",
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    bcp47: "gu-IN",
    script: "Gujarati",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: true,
    voiceConfig: {
      femaleVoice: "gu-IN-DhwaniNeural",
      maleVoice: "gu-IN-NiranjanNeural",
      engine: "edge-neural",
      quality: "verified-high",
    },
    voiceNote: "Warm, encouraging cadence for beginner practice.",
    speechRecognitionCode: "gu-IN",
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    bcp47: "pa-IN",
    script: "Gurmukhi",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: false,
    voiceNote: "Text responses fully supported. Dedicated neural voice currently unavailable.",
    speechRecognitionCode: "pa-IN",
  },
  {
    code: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    bcp47: "or-IN",
    script: "Odia",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: false,
    voiceNote: "Text responses fully supported. Dedicated neural voice currently unavailable.",
    speechRecognitionCode: "or-IN",
  },
  {
    code: "as",
    name: "Assamese",
    nativeName: "অসমীয়া",
    bcp47: "as-IN",
    script: "Bengali-Assamese",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: false,
    voiceNote: "Text responses fully supported. Dedicated neural voice currently unavailable.",
    speechRecognitionCode: "as-IN",
  },
  {
    code: "sa",
    name: "Sanskrit",
    nativeName: "संस्कृतम्",
    bcp47: "sa-IN",
    script: "Devanagari",
    direction: "ltr",
    textSupport: "full",
    voiceSupport: true,
    voiceConfig: {
      femaleVoice: "hi-IN-SwaraNeural",
      maleVoice: "hi-IN-MadhurNeural",
      engine: "classical-bed",
      quality: "verified-medium",
    },
    voiceNote: "Classical recitation delivered via phonetically calibrated Shastri voice bed.",
    speechRecognitionCode: "sa-IN",
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    bcp47: "ur-IN",
    script: "Nastaliq / Arabic",
    direction: "rtl",
    textSupport: "full",
    voiceSupport: true,
    voiceConfig: {
      femaleVoice: "ur-IN-GulNeural",
      maleVoice: "ur-IN-SalmanNeural",
      engine: "edge-neural",
      quality: "verified-high",
    },
    voiceNote: "Polite, lyrical Urdu delivery with clear classical articulation.",
    speechRecognitionCode: "ur-IN",
  },
];

/**
 * Sacred classical terms that must NEVER be translated into literal approximations.
 * They must be preserved as proper nouns/transliterations and explained contextually.
 */
export const PRESERVED_CLASSICAL_TERMS = [
  "Aramandi",
  "Samapada",
  "Muzhumandi",
  "Natayarambha",
  "Pataka",
  "Tripataka",
  "Ardhapataka",
  "Kartarimukha",
  "Mayura",
  "Ardhachandra",
  "Arala",
  "Shukatunda",
  "Mushti",
  "Shikhara",
  "Kapittha",
  "Katak मुख",
  "Suchi",
  "Chandrakala",
  "Padmakosha",
  "Sarpashirsha",
  "Mrigashirsha",
  "Simhamukha",
  "Kangula",
  "Alapadma",
  "Chatura",
  "Bhramara",
  "Hamsasya",
  "Hamsapaksha",
  "Sandamsha",
  "Mukula",
  "Tamrachuda",
  "Trishula",
  "Anjali",
  "Asamyukta Hasta",
  "Samyukta Hasta",
  "Sollukattu",
  "Adi Tala",
  "Nritta",
  "Nritya",
  "Natya",
  "Abhinaya",
  "Natyashastra",
  "Abhinaya Darpana",
  "Tatta Adavu",
  "Natta Adavu",
  "Kuditta Mettu",
  "Tirmana Adavu",
  "Korvai",
  "Arangetram",
  "Namaskaram",
  "Bhumi Pranam",
] as const;

export function getLanguageConfig(code: string): LanguageConfig {
  const normalized = code.toLowerCase().trim();
  const match = INDIAN_REGIONAL_LANGUAGES.find(
    (l) => l.code === normalized || l.bcp47.toLowerCase().startsWith(normalized)
  );
  return match || INDIAN_REGIONAL_LANGUAGES[0]; // fallback to English
}

export function isVoiceSupported(code: string): boolean {
  return getLanguageConfig(code).voiceSupport;
}

export function getBcp47Locale(code: string): string {
  return getLanguageConfig(code).bcp47;
}

/**
 * Prepares clean, phonetically spaced text for TTS engines without altering visible markdown.
 * Preserves Sollukattu pacing and expands technical punctuation.
 */
export function prepareSpokenText(
  rawText: string,
  langCode: string = "en"
): { spokenText: string; isVoiceAvailable: boolean } {
  const config = getLanguageConfig(langCode);
  if (!config.voiceSupport) {
    return {
      spokenText: "",
      isVoiceAvailable: false,
    };
  }

  // 1. Remove markdown markers, callout banners, and URLs
  let cleaned = rawText
    .replace(/^>\s*⚠️.*$/gm, "")
    .replace(/^>\s*ℹ️.*$/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_#`~>]/g, "")
    .replace(/\r\n/g, "\n");

  // 2. Pace Sollukattu syllables with breathing pauses (e.g. "Tai Ya Tai Hi" -> "Tai, Ya, Tai, Hi")
  cleaned = cleaned.replace(/\b(Tai)\s+(Ya)\s+(Tai)\s+(Hi)\b/gi, "$1, $2, $3, $4");

  // 3. Normalize whitespace
  cleaned = cleaned.replace(/\n+/g, ". ").replace(/\s+/g, " ").trim();

  return {
    spokenText: cleaned,
    isVoiceAvailable: true,
  };
}
