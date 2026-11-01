import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  INDIAN_REGIONAL_LANGUAGES,
  getLanguageConfig,
  isVoiceSupported,
  prepareSpokenText,
} from "../src/lib/guru/languageCatalog.ts";

import {
  retrieveGroundedKnowledge,
} from "../src/lib/guru/knowledgeRetriever.ts";

import {
  synthesizeDeterministicGroundedAnswer,
} from "../src/lib/guru/guruSynthesizer.ts";

import {
  tokenizeInlineMarkdown,
  parseMarkdownBlocks,
} from "../src/lib/guru/markdownParser.ts";

describe("Phase 8.1: Virtual Guru Polish — Markdown UI, Regional Languages & Natural Voice", () => {
  // PART 1: MARKDOWN RENDERING & SAFE PARSING
  describe("1. Markdown Parsing & XSS Safety", () => {
    it("parses bold, italic, and inline code correctly", () => {
      const text = "Observe the **Aramandi** stance with *precision* and `Kati Hastha`.";
      const tokens = tokenizeInlineMarkdown(text);

      const boldToken = tokens.find((t) => t.type === "bold");
      assert.ok(boldToken, "Must identify bold token");
      assert.equal(boldToken?.value, "Aramandi");

      const italicToken = tokens.find((t) => t.type === "italic");
      assert.ok(italicToken, "Must identify italic token");
      assert.equal(italicToken?.value, "precision");

      const codeToken = tokens.find((t) => t.type === "code");
      assert.ok(codeToken, "Must identify code token");
      assert.equal(codeToken?.value, "Kati Hastha");
    });

    it("parses safe internal links", () => {
      const text = "Study the [Pataka Hasta](/library/pataka) in our 3D library.";
      const tokens = tokenizeInlineMarkdown(text);
      const linkToken = tokens.find((t) => t.type === "link");

      assert.ok(linkToken, "Must identify link token");
      if (linkToken?.type === "link") {
        assert.equal(linkToken.label, "Pataka Hasta");
        assert.equal(linkToken.href, "/library/pataka");
        assert.equal(linkToken.isInternal, true);
        assert.equal(linkToken.isSafe, true);
      }
    });

    it("sanitizes unsafe javascript: links to prevent XSS", () => {
      const malicious = "Click here: [Unsafe](javascript:alert(1))";
      const tokens = tokenizeInlineMarkdown(malicious);

      // Malicious link scheme must be stripped or emitted as text, not a link
      const hasUnsafeLink = tokens.some((t) => t.type === "link" && !t.isSafe);
      assert.equal(hasUnsafeLink, false, "Must never emit unsafe link token");

      const labelToken = tokens.find((t) => (t.type === "text" && t.value === "Unsafe") || (t.type === "link" && t.label === "Unsafe"));
      assert.ok(labelToken, "Should keep label text safely without executing script");
    });

    it("parses headings, lists, blockquotes, and paragraphs into blocks", () => {
      const md = `### Geometry
The knees flex outward while torso remains upright.

> Turnout must originate from hip joints.

- Feet turned outward
- Spine straight

1. Strike right foot
2. Strike left foot`;

      const blocks = parseMarkdownBlocks(md);
      assert.ok(blocks.some((b) => b.type === "heading" && b.text === "Geometry"));
      assert.ok(blocks.some((b) => b.type === "p"));
      assert.ok(blocks.some((b) => b.type === "blockquote"));
      assert.ok(blocks.some((b) => b.type === "ul" && b.items.length === 2));
      assert.ok(blocks.some((b) => b.type === "ol" && b.items.length === 2));
    });
  });

  // PART 2: INDIAN REGIONAL LANGUAGE CATALOG & CAPABILITY MATRIX
  describe("2. Regional Language Catalog & Capability Matrix", () => {
    it("contains all 14 required Indian languages with authentic native scripts", () => {
      const expectedCodes = [
        "en", "hi", "ta", "te", "kn", "ml", "bn", "mr", "gu", "pa", "or", "as", "sa", "ur"
      ];
      assert.equal(INDIAN_REGIONAL_LANGUAGES.length, 14, "Must support all 14 target languages");

      for (const code of expectedCodes) {
        const conf = getLanguageConfig(code);
        assert.ok(conf, `Language ${code} must exist in catalog`);
        assert.ok(conf.nativeName.length > 0, `Language ${code} must have native script name`);
        assert.ok(conf.bcp47.length > 0, `Language ${code} must have BCP-47 tag`);
      }
    });

    it("verifies native scripts for all 14 languages", () => {
      assert.equal(getLanguageConfig("hi").nativeName, "हिंदी");
      assert.equal(getLanguageConfig("ta").nativeName, "தமிழ்");
      assert.equal(getLanguageConfig("te").nativeName, "తెలుగు");
      assert.equal(getLanguageConfig("kn").nativeName, "ಕನ್ನಡ");
      assert.equal(getLanguageConfig("ml").nativeName, "മലയാളം");
      assert.equal(getLanguageConfig("bn").nativeName, "বাংলা");
      assert.equal(getLanguageConfig("mr").nativeName, "मराठी");
      assert.equal(getLanguageConfig("gu").nativeName, "ગુજરાતી");
      assert.equal(getLanguageConfig("pa").nativeName, "ਪੰਜਾਬੀ");
      assert.equal(getLanguageConfig("or").nativeName, "ଓଡ଼ିଆ");
      assert.equal(getLanguageConfig("as").nativeName, "অসমীয়া");
      assert.equal(getLanguageConfig("sa").nativeName, "संस्कृतम्");
      assert.equal(getLanguageConfig("ur").nativeName, "اردو");
    });

    it("honestly identifies voice availability: verified neural vs text-only languages", () => {
      // Languages with verified Edge-TTS neural voices
      assert.equal(isVoiceSupported("en"), true);
      assert.equal(isVoiceSupported("hi"), true);
      assert.equal(isVoiceSupported("ta"), true);
      assert.equal(isVoiceSupported("te"), true);
      assert.equal(isVoiceSupported("kn"), true);
      assert.equal(isVoiceSupported("ml"), true);
      assert.equal(isVoiceSupported("bn"), true);
      assert.equal(isVoiceSupported("mr"), true);
      assert.equal(isVoiceSupported("gu"), true);
      assert.equal(isVoiceSupported("ur"), true);
      assert.equal(isVoiceSupported("sa"), true);

      // Text-only languages where neural voices are not available
      assert.equal(isVoiceSupported("pa"), false, "Punjabi must be honestly reported as text-only");
      assert.equal(isVoiceSupported("or"), false, "Odia must be honestly reported as text-only");
      assert.equal(isVoiceSupported("as"), false, "Assamese must be honestly reported as text-only");
    });
  });

  // PART 3: PRESERVATION OF CLASSICAL TERMINOLOGY
  describe("3. Classical Bharatanatyam Terminology Preservation", () => {
    it("strictly preserves key Sanskrit & Tamil terms in Hindi answers", () => {
      const ctx = retrieveGroundedKnowledge("What is Aramandi?", "samapada-and-aramandi");
      const res = synthesizeDeterministicGroundedAnswer(ctx, [], "hi");

      assert.ok(res.answer.includes("Aramandi"), "Must preserve 'Aramandi' in Hindi response");
      assert.ok(res.answer.includes("कलाक्षेत्र"), "Must preserve lineage reference in Hindi");
      assert.ok(res.answer.includes("Geometry"), "Must preserve section context in Hindi");
    });

    it("strictly preserves key terms in Tamil answers", () => {
      const ctx = retrieveGroundedKnowledge("What is Aramandi?", "samapada-and-aramandi");
      const res = synthesizeDeterministicGroundedAnswer(ctx, [], "ta");

      assert.ok(res.answer.includes("Aramandi"), "Must preserve 'Aramandi' in Tamil response");
      assert.ok(res.answer.includes("கலாக்ஷேத்ரா"), "Must preserve Kalakshetra lineage in Tamil");
      assert.ok(res.answer.includes("Geometry"), "Must preserve geometry section in Tamil");
    });

    it("strictly preserves key terms in Telugu answers", () => {
      const ctx = retrieveGroundedKnowledge("What is Aramandi?", "samapada-and-aramandi");
      const res = synthesizeDeterministicGroundedAnswer(ctx, [], "te");

      assert.ok(res.answer.includes("Aramandi"), "Must preserve 'Aramandi' in Telugu response");
      assert.ok(res.answer.includes("కళాక్షేత్ర"), "Must preserve Kalakshetra lineage in Telugu");
    });

    it("preserves Sollukattu and Tala terms in Tatta vs Natta adavu comparison", () => {
      const ctx = retrieveGroundedKnowledge("How is Tatta Adavu different from Natta Adavu?", "thattadavu");
      const resHi = synthesizeDeterministicGroundedAnswer(ctx, [], "hi");
      const resTa = synthesizeDeterministicGroundedAnswer(ctx, [], "ta");

      assert.ok(resHi.answer.includes("Tatta Adavu"), "Must preserve Tatta Adavu term in Hindi");
      assert.ok(resHi.answer.includes("Natta Adavu"), "Must preserve Natta Adavu term in Hindi");
      assert.ok(resHi.answer.includes("Tai Ya Tai Hi"), "Must preserve Sollukattu in Hindi");

      assert.ok(resTa.answer.includes("Tatta Adavu"), "Must preserve Tatta Adavu term in Tamil");
      assert.ok(resTa.answer.includes("Natta Adavu"), "Must preserve Natta Adavu term in Tamil");
      assert.ok(resTa.answer.includes("Tai Ya Tai Hi"), "Must preserve Sollukattu in Tamil");
    });
  });

  // PART 4: MULTILINGUAL GROUNDING & PROVENANCE INTEGRITY
  describe("4. Multilingual Grounding & Validation Guard", () => {
    it("maintains 'in-production' status when answering about Natta Adavu in regional languages", () => {
      const ctx = retrieveGroundedKnowledge("Tell me about Natta Adavu", "natta-adavu");
      const resHi = synthesizeDeterministicGroundedAnswer(ctx, [], "hi");
      const resTa = synthesizeDeterministicGroundedAnswer(ctx, [], "ta");

      assert.equal(ctx.validationStatus, "in-production");
      assert.ok(
        resHi.answer.includes("स्टूडियो रिकॉर्डिंग") || resHi.answer.includes("3D"),
        "Hindi answer must preserve in-production motion capture status"
      );
      assert.ok(
        resTa.answer.includes("ஸ்டுடியோ தயாரிப்பில்") || resTa.answer.includes("3D"),
        "Tamil answer must preserve in-production motion capture status"
      );
    });

    it("honestly refuses out-of-scope inquiries in the selected language", () => {
      const ctx = retrieveGroundedKnowledge("Can you teach me hip hop dancing?");
      assert.equal(ctx.isOutOfScope, true);

      const resHi = synthesizeDeterministicGroundedAnswer(ctx, [], "hi");
      assert.ok(resHi.answer.includes("शास्त्रीय भरतनाट्यम"), "Hindi refusal must be grounded in classical boundary");

      const resTa = synthesizeDeterministicGroundedAnswer(ctx, [], "ta");
      assert.ok(resTa.answer.includes("பாரம்பரிய பரதநாட்டியத்தில்"), "Tamil refusal must be grounded in classical boundary");
    });
  });

  // PART 5: SPEECH PREPARATION & GOONJ TTS REFINEMENT
  describe("5. Natural Voice Speech Preparation", () => {
    it("strips markdown symbols and formats clean spoken text", () => {
      const raw = "**Step 1: Namaskaram**\n\n• Begin standing in **Samapada**.\n> ⚠️ Keep your spine upright.";
      const { spokenText, isVoiceAvailable } = prepareSpokenText(raw, "en");

      assert.equal(isVoiceAvailable, true);
      assert.ok(!spokenText.includes("**"), "Must strip bold asterisks");
      assert.ok(!spokenText.includes("⚠️"), "Must strip callout emojis");
      assert.ok(spokenText.includes("Step 1: Namaskaram"), "Must retain core words");
    });

    it("spaces Sollukattu syllables with pauses for natural rhythm playback", () => {
      const raw = "The rhythm for Thattadavu is Tai Ya Tai Hi.";
      const { spokenText } = prepareSpokenText(raw, "en");

      assert.ok(
        spokenText.includes("Tai, Ya, Tai, Hi"),
        "Must insert breathing pauses between Sollukattu syllables"
      );
    });

    it("returns empty speech and false flag for text-only languages to prevent garbage audio", () => {
      const raw = "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਅਰਮੰਡੀ ਬਾਰੇ ਦੱਸੋ।";
      const { spokenText, isVoiceAvailable } = prepareSpokenText(raw, "pa");

      assert.equal(isVoiceAvailable, false, "Punjabi must report no voice available");
      assert.equal(spokenText, "", "Must return empty spokenText rather than garbled audio");
    });
  });
});
