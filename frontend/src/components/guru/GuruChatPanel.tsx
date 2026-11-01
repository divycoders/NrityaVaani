"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Loader2,
  Globe,
  User,
} from "lucide-react";
import {
  type GuruPersona,
  getBestPersonaForLanguage,
} from "@/lib/voice/guruPersonas";
import type { GuruAudioEngine } from "@/lib/voice/guruAudioEngine";
import type { Language } from "@/lib/lesson/manifest";
import {
  INDIAN_REGIONAL_LANGUAGES,
  getLanguageConfig,
  isVoiceSupported,
} from "@/lib/guru/languageCatalog";
import GuruMarkdown from "./GuruMarkdown";

export interface ChatMessage {
  id: string;
  role: "user" | "guru";
  text: string;
  spokenText?: string;
  sources?: string[];
  validationStatus?: string;
  statusLabel?: string;
  tradition?: string;
  safetyAdvisory?: string;
  relatedLinks?: { title: string; href: string; type: "lesson" | "mudra" | "curriculum" }[];
  timestamp: number;
}

interface GuruChatPanelProps {
  currentLessonSlug?: string;
  currentLessonTitle?: string;
  currentChapterIndex?: number;
  currentChapterTitle?: string;
  currentStepIndex?: number;
  currentStepName?: string;
  currentStepGloss?: string;
  currentStepCues?: string[];
  personaId?: string;
  lang?: string;
  audioEngine?: GuruAudioEngine | null;
  className?: string;
}


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

const DEFAULT_SUGGESTIONS_BY_LANG: Record<string, string[]> = {
  en: [
    "What is Aramandi?",
    "How is Tatta Adavu different from Natta Adavu?",
    "Explain Pataka Hasta.",
    "Why do we perform Namaskaram?",
    "What should I learn after this lesson?",
    "Explain this movement simply.",
  ],
  hi: [
    "Aramandi क्या है?",
    "Tatta Adavu और Natta Adavu में क्या अंतर है?",
    "Pataka Hasta समझाइए।",
    "Namaskaram क्यों करते हैं?",
    "इस पाठ के बाद मुझे क्या सीखना चाहिए?",
    "इस गति को सरलता से समझाएं।",
  ],
  ta: [
    "Aramandi என்றால் என்ன?",
    "Tatta Adavu மற்றும் Natta Adavu வேறுபாடு என்ன?",
    "Pataka Hasta விளக்குக.",
    "Namaskaram எதற்கு செய்கிறோம்?",
    "இந்தப் பாடத்திற்குப் பிறகு என்ன கற்க வேண்டும்?",
    "இந்த இயக்கத்தை எளிமையாக விளக்குக.",
  ],
  te: [
    "Aramandi అంటే ఏమిటి?",
    "Tatta Adavu మరియు Natta Adavu మధ్య తేడా ఏమిటి?",
    "Pataka Hasta వివరించండి.",
    "Namaskaram ఎందుకు చేస్తాము?",
    "ఈ పాఠం తర్వాత ఏమి నేర్చుకోవాలి?",
    "ఈ కదలికను సులభంగా వివరించండి.",
  ],
};

export default function GuruChatPanel({
  currentLessonSlug,
  currentLessonTitle,
  currentChapterIndex,
  currentChapterTitle,
  currentStepIndex,
  currentStepName,
  currentStepGloss,
  currentStepCues,
  lang: initialLang = "en",
  audioEngine,
  className = "",
}: GuruChatPanelProps) {
  const [selectedLang, setSelectedLang] = useState<string>(initialLang);
  const [mentorGender, setMentorGender] = useState<"female" | "male">("female");
  const [activePersona, setActivePersona] = useState<GuruPersona>(() =>
    getBestPersonaForLanguage(initialLang as Language, "female")
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "guru",
      text: currentLessonTitle
        ? currentStepName
          ? `Namaste! I am your 3D Virtual Guru. We are exploring **${currentLessonTitle}** at **Step ${(currentStepIndex ?? 0) + 1}: ${currentStepName}**. Ask me about the hand alignment, rhythm, footwork cues, or what to observe in the 3D demonstration.`
          : `Namaste! I am your 3D Virtual Guru. We are exploring **${currentLessonTitle}**. Ask me about the body geometry, technique cues, rhythm, or how to avoid common mistakes.`
        : "Namaste! I am your 3D Virtual Guru. I am here to guide your Bharatanatyam sadhana. Ask me about foundational stances, adavus, mudras, or rhythm concepts.",
      timestamp: Date.now(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const currentLangConfig = getLanguageConfig(selectedLang);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Sync audio engine language & persona when language or mentor gender changes
  const handleLanguageChange = (newLang: string) => {
    setSelectedLang(newLang);
    const best = getBestPersonaForLanguage(newLang as Language, mentorGender);
    setActivePersona(best);
    if (audioEngine) {
      audioEngine.setLanguage(newLang as Language);
      audioEngine.setPersona(best.id);
    }
  };

  const handleGenderToggle = () => {
    const nextGender = mentorGender === "female" ? "male" : "female";
    setMentorGender(nextGender);
    const best = getBestPersonaForLanguage(selectedLang as Language, nextGender);
    setActivePersona(best);
    if (audioEngine) {
      audioEngine.setPersona(best.id);
    }
  };

  // Context synchronization: notify learner when navigating between lessons
  const prevLessonSlugRef = useRef<string | undefined>(currentLessonSlug);
  useEffect(() => {
    if (prevLessonSlugRef.current !== currentLessonSlug) {
      prevLessonSlugRef.current = currentLessonSlug;
      if (currentLessonTitle) {
        setMessages((prev) => [
          ...prev,
          {
            id: `transition-${Date.now()}`,
            role: "guru",
            text: `We have transitioned to **${currentLessonTitle}**. Ask me about the body geometry, technique cues, rhythm, or common mistakes for this lesson.`,
            timestamp: Date.now(),
          },
        ]);
      }
    }
  }, [currentLessonSlug, currentLessonTitle]);

  // Context synchronization: notify learner when step changes during 3D demonstration
  const prevStepNameRef = useRef<string | undefined>(currentStepName);
  useEffect(() => {
    if (currentStepName && prevStepNameRef.current !== currentStepName) {
      prevStepNameRef.current = currentStepName;
    }
  }, [currentStepName]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    if (textToSend.length > 500) {
      setError("Questions are limited to 500 characters. Please be concise.");
      return;
    }

    setError(null);
    setInput("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Build conversation history format (last 4 turns)
      const history = messages.slice(-4).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch("/api/guru/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          currentLessonSlug,
          currentStep: currentStepName
            ? {
                index: currentStepIndex ?? 0,
                name: currentStepName,
                gloss: currentStepGloss,
                cues: currentStepCues,
              }
            : undefined,
          history,
          persona: activePersona.id,
          lang: selectedLang,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Unable to reach the Guru Assistant.");
      }

      const data = await res.json();
      const guruMessage: ChatMessage = {
        id: `guru-${Date.now()}`,
        role: "guru",
        text: data.answer,
        spokenText: data.spokenText || data.answer,
        sources: data.sources,
        validationStatus: data.validationStatus,
        statusLabel: data.statusLabel,
        tradition: data.tradition,
        safetyAdvisory: data.safetyAdvisory,
        relatedLinks: data.relatedLinks,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, guruMessage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to receive Guru answer";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeak = (msg: ChatMessage) => {
    // If clicking on active speaking message, stop playback
    if (speakingMessageId === msg.id) {
      audioEngine?.stop();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageId(null);
      return;
    }

    // Check voice support for the selected language
    if (!isVoiceSupported(selectedLang)) {
      setError(
        `Voice synthesis is currently unavailable for ${currentLangConfig.name} (${currentLangConfig.nativeName}). The verified textual guidance is shown above.`
      );
      return;
    }

    setError(null);
    setSpeakingMessageId(msg.id);

    if (!audioEngine) {
      // Fallback directly to browser Web Speech API
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(msg.spokenText || msg.text);
        utter.lang = currentLangConfig.bcp47;
        utter.pitch = activePersona.voicePitch;
        utter.rate = activePersona.voiceRate;
        utter.onend = () => setSpeakingMessageId(null);
        utter.onerror = () => setSpeakingMessageId(null);
        window.speechSynthesis.speak(utter);
      }
      return;
    }

    void audioEngine.speakAnswer(msg.spokenText || msg.text, () => {
      setSpeakingMessageId(null);
    });
  };

  const handleReset = () => {
    audioEngine?.stop();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setMessages([
      {
        id: "welcome-reset",
        role: "guru",
        text: "Conversation cleared. Ask me any Bharatanatyam question to begin fresh.",
        timestamp: Date.now(),
      },
    ]);
    setError(null);
  };

  // Lesson-specific and step-specific question suggestions
  const activeSuggestions = getLessonSpecificSuggestions(
    currentLessonSlug,
    currentChapterIndex,
    currentStepName,
    selectedLang
  );

  return (
    <div className={`flex flex-col h-full bg-card/95 border border-card-border rounded-2xl overflow-hidden shadow-lg ${className}`}>
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-foreground/10 bg-background/50 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-serif font-bold text-sm shrink-0">
            ॐ
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="serif text-[0.98rem] font-semibold text-foreground/95 leading-none truncate">
                {activePersona.name}
              </h3>
              <span className="mono text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                {activePersona.badge}
              </span>
            </div>
            <p className="serif text-[0.8rem] italic text-foreground/60 leading-tight mt-0.5 truncate">
              {currentStepName ? `Step ${(currentStepIndex ?? 0) + 1}: ${currentStepName}` : activePersona.title}
            </p>
          </div>
        </div>

        {/* Language Selector & Mentor Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Gender Toggle */}
          <button
            type="button"
            onClick={handleGenderToggle}
            className="mono text-[8.5px] uppercase tracking-wider px-2 py-1 rounded bg-foreground/5 hover:bg-foreground/10 border border-foreground/12 text-foreground/75 hover:text-foreground flex items-center gap-1 transition-colors"
            title={`Switch to ${mentorGender === "female" ? "Male Natyacharya" : "Female Guru"}`}
          >
            <User className="h-2.5 w-2.5 text-primary" />
            <span>{mentorGender === "female" ? "Female Guru" : "Male Guru"}</span>
          </button>

          {/* Regional Language Dropdown */}
          <div className="relative inline-flex items-center">
            <Globe className="h-3 w-3 text-primary absolute left-2 pointer-events-none" />
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="mono text-[9px] appearance-none pl-6 pr-6 py-1 rounded bg-foreground/5 hover:bg-foreground/10 border border-foreground/15 text-foreground/90 font-medium focus:outline-none focus:border-primary/50 cursor-pointer"
              aria-label="Select Indian regional language"
            >
              {INDIAN_REGIONAL_LANGUAGES.map((langOpt) => (
                <option key={langOpt.code} value={langOpt.code} className="bg-slate-900 text-foreground py-1">
                  {langOpt.nativeName} ({langOpt.name}) {langOpt.voiceSupport ? "· 🔊" : "· 📝"}
                </option>
              ))}
            </select>
            <span className="mono text-[8px] text-foreground/40 absolute right-1.5 pointer-events-none">▼</span>
          </div>

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleReset}
            className="mono text-[9px] uppercase tracking-wider text-foreground/45 hover:text-foreground inline-flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-foreground/5"
            title="Reset conversation"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Language Capability Notice Bar if Text-Only Language */}
      {!currentLangConfig.voiceSupport && (
        <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-[10px] flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3 shrink-0 text-amber-400" />
          <span>
            <strong>{currentLangConfig.name} ({currentLangConfig.nativeName})</strong>: Verified text responses are fully active. Dedicated neural voice is in studio development.
          </span>
        </div>
      )}

      {/* Suggested Beginner Questions Bar */}
      <div className="px-3 py-2 border-b border-foreground/8 bg-card/60 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
        <span className="mono text-[8.5px] uppercase tracking-wider text-foreground/45 shrink-0 flex items-center gap-1">
          <HelpCircle className="h-2.5 w-2.5 text-primary" /> Suggestions:
        </span>
        {activeSuggestions.map((sug) => (
          <button
            key={sug}
            type="button"
            onClick={() => handleSend(sug)}
            disabled={loading}
            className="mono shrink-0 text-[9px] rounded-full px-2.5 py-1 bg-foreground/5 border border-foreground/12 text-foreground/75 hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-40"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[94%] sm:max-w-[85%] rounded-2xl p-4 shadow-sm text-[0.95rem] leading-[1.6] ${
                m.role === "user"
                  ? "bg-primary text-black font-medium rounded-br-xs"
                  : "bg-background/80 border border-foreground/12 text-foreground/90 rounded-bl-xs"
              }`}
            >
              {/* Guru response header tags */}
              {m.role === "guru" && (
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-foreground/8">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="mono text-[9px] uppercase tracking-wider font-semibold text-primary">
                      {activePersona.name}
                    </span>
                    {m.statusLabel && (
                      <span
                        className={`mono text-[8.5px] uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                          m.validationStatus === "source-supported"
                            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                            : m.validationStatus === "guru-review-required"
                            ? "border-amber-500/30 text-amber-400 bg-amber-500/10"
                            : "border-sky-500/30 text-sky-400 bg-sky-500/10"
                        }`}
                      >
                        {m.statusLabel}
                      </span>
                    )}
                  </div>

                  {/* Listen / Stop audio controls */}
                  <button
                    type="button"
                    onClick={() => toggleSpeak(m)}
                    className={`mono inline-flex items-center gap-1 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors ${
                      speakingMessageId === m.id
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    }`}
                    title={
                      !isVoiceSupported(selectedLang)
                        ? "Voice unavailable for this language"
                        : speakingMessageId === m.id
                        ? "Stop speech"
                        : "Listen to Guru"
                    }
                  >
                    {speakingMessageId === m.id ? (
                      <>
                        <VolumeX className="h-3 w-3 text-rose-400 animate-pulse" />
                        <span className="font-semibold text-rose-400">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3 w-3" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Message text with proper Markdown typography */}
              <div className="serif">
                {m.role === "guru" ? (
                  <GuruMarkdown content={m.text} />
                ) : (
                  <div className="whitespace-pre-line font-medium">{m.text}</div>
                )}
              </div>

              {/* Safety advisory note if present */}
              {m.safetyAdvisory && (
                <div className="mt-3 p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] text-xs text-amber-300 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                  <span className="serif text-[0.88rem] leading-snug">
                    <strong>Safety Note:</strong> {m.safetyAdvisory}
                  </span>
                </div>
              )}

              {/* Sources footer */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-foreground/10 text-xs text-foreground/50">
                  <span className="mono text-[8px] uppercase tracking-wider text-foreground/40 block mb-0.5">
                    Knowledge Source:
                  </span>
                  <span className="serif italic text-[0.85rem] text-foreground/65">
                    {m.sources.join(" · ")}
                  </span>
                </div>
              )}

              {/* Related links */}
              {m.relatedLinks && m.relatedLinks.length > 0 && (
                <div className="mt-3 pt-2 border-t border-foreground/10 flex flex-wrap gap-2">
                  {m.relatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="mono inline-flex items-center gap-1 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-foreground/5 hover:bg-primary/15 hover:text-primary transition-colors text-foreground/70 border border-foreground/12"
                    >
                      <BookOpen className="h-2.5 w-2.5 text-primary" />
                      <span>{link.title}</span>
                      <ArrowRight className="h-2.5 w-2.5 ml-0.5 opacity-60" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-foreground/50 p-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="mono text-[10px] uppercase tracking-wider">
              {activePersona.name} is reflecting in {currentLangConfig.nativeName}…
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <span className="text-[11px] leading-tight">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-foreground/50 hover:text-foreground text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Form */}
      <div className="p-3 border-t border-foreground/10 bg-background/70">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask in ${currentLangConfig.nativeName} (${currentLangConfig.name})…`}
            disabled={loading}
            maxLength={500}
            className="flex-1 bg-background border border-foreground/15 rounded-xl px-3.5 py-2 text-[0.93rem] text-foreground focus:outline-none focus:border-primary/50 transition-colors placeholder:text-foreground/35 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="h-10 w-10 rounded-xl bg-primary text-black flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:hover:bg-primary shrink-0 cursor-pointer shadow-sm"
            title="Send question"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <div className="flex items-center justify-between mt-1 px-1">
          <span className="mono text-[8px] uppercase tracking-wider text-foreground/35">
            Grounded in Natyashastra · Abhinaya Darpana
          </span>
          <span className="mono text-[8px] text-foreground/35">
            {input.length}/500
          </span>
        </div>
      </div>
    </div>
  );
}
