import unittest
from unittest.mock import patch
from backend.core.goonj_tts import GoonjTTSEngine, GOONJ_PERSONAS, SUPPORTED_LANGUAGES
from backend.main import app, SpeakRequest, speak_cue
from fastapi import HTTPException

class TestGoonjTTS(unittest.TestCase):
    def setUp(self):
        self.engine = GoonjTTSEngine()

    def test_persona_catalog(self):
        personas = self.engine.get_personas()
        self.assertEqual(len(personas), 15)
        # Check default persona hi_meera exists
        meera = next((p for p in personas if p["id"] == "hi_meera"), None)
        self.assertIsNotNone(meera)
        self.assertEqual(meera["name"], "Guru Meera")
        self.assertEqual(meera["voice"], "hi-IN-SwaraNeural")

    def test_language_catalog(self):
        langs = self.engine.get_languages()
        self.assertEqual(len(langs), 14)
        codes = [l["code"] for l in langs]
        self.assertIn("en", codes)
        self.assertIn("hi", codes)
        self.assertIn("ta", codes)
        self.assertIn("te", codes)
        self.assertIn("ur", codes)
        self.assertIn("pa", codes)

    def test_empty_text_returns_none(self):
        # Empty text should gracefully return None without errors
        res1 = self.engine.synthesize("")
        res2 = self.engine.synthesize("   \n\t  ")
        self.assertIsNone(res1)
        self.assertIsNone(res2)

    def test_cache_key_generation(self):
        p1 = self.engine._get_cache_path("Namaskaram", "hi_meera", "en", 1.0)
        p2 = self.engine._get_cache_path("Namaskaram", "hi_meera", "en", 1.0)
        p3 = self.engine._get_cache_path("Different Text", "hi_meera", "en", 1.0)
        self.assertEqual(p1, p2)
        self.assertNotEqual(p1, p3)
        self.assertTrue(p1.name.endswith(".mp3"))

    def test_graceful_error_capture_when_synthesis_fails(self):
        """
        When downstream neural synthesis fails (e.g., service error, network block),
        the engine must catch the exception, populate last_error, and return None cleanly.
        """
        with patch.object(self.engine, "_generate_neural_audio", side_effect=RuntimeError("Simulated speech service outage")):
            res = self.engine.synthesize("Test cue text for failure handling", persona="hi_meera", lang="en")
            self.assertIsNone(res)
            self.assertIsNotNone(self.engine.last_error)
            self.assertIn("Simulated speech service outage", self.engine.last_error)

    def test_speak_cue_endpoint_empty_text_validation(self):
        # speak_cue raises HTTPException(400) for empty cues
        with self.assertRaises(HTTPException) as ctx:
            speak_cue(SpeakRequest(text=""))
        self.assertEqual(ctx.exception.status_code, 400)

    def test_speak_cue_endpoint_fallback_structure(self):
        """
        When engine.synthesize returns None, the FastAPI endpoint must return
        the fallback payload with status="fallback_web_speech" and clear error details.
        """
        from backend.main import engine as main_engine
        with patch.object(main_engine, "synthesize", return_value=None):
            main_engine.last_error = "Connection reset by peer"
            response = speak_cue(SpeakRequest(text="Bend your knees into aramandi", persona="hi_meera"))
            
            self.assertIsInstance(response, dict)
            self.assertEqual(response["status"], "fallback_web_speech")
            self.assertIn("Connection reset by peer", response["message"])
            self.assertEqual(response["text"], "Bend your knees into aramandi")
            self.assertEqual(response["persona"], "hi_meera")

if __name__ == "__main__":
    unittest.main()
