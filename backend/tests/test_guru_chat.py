import unittest
from backend.main import GuruChatRequest, guru_chat
from backend.core.guru_assistant import answer_guru_question
from fastapi import HTTPException

class TestGuruAssistant(unittest.TestCase):
    def test_aramandi_grounded_answer(self):
        res = answer_guru_question("What is Aramandi?")
        self.assertIn("Aramandi", res["answer"])
        self.assertIn("diamond", res["answer"].lower())
        self.assertIn("hip", res["answer"].lower())
        self.assertEqual(res["validation_status"], "guru-review-required")
        self.assertIn("turnout", res.get("safety_advisory", "").lower())

    def test_pataka_mudra_grounded_answer(self):
        res = answer_guru_question("Explain Pataka Hasta")
        self.assertIn("Pataka", res["answer"])
        self.assertIn("Flag", res["answer"])
        self.assertEqual(res["validation_status"], "source-supported")

    def test_tatta_vs_natta_adavu_distinction(self):
        res = answer_guru_question("How is Tatta Adavu different from Natta Adavu?")
        self.assertIn("Tatta Adavu", res["answer"])
        self.assertIn("Natta Adavu", res["answer"])
        self.assertIn("heel", res["answer"].lower())
        self.assertIn("production", res["answer"].lower())

    def test_namaskaram_grounded_answer(self):
        res = answer_guru_question("Why do we perform Namaskaram?")
        self.assertIn("Namaskaram", res["answer"])
        self.assertIn("Mother Earth", res["answer"])

    def test_unsupported_out_of_scope_question(self):
        res = answer_guru_question("What is the stock market price of Apple?")
        self.assertEqual(res["validation_status"], "unsupported")
        self.assertIn("not currently covered in our beginner curriculum", res["answer"])

    def test_empty_message_validation(self):
        with self.assertRaises(HTTPException) as ctx:
            guru_chat(GuruChatRequest(message=""))
        self.assertEqual(ctx.exception.status_code, 400)

    def test_excessive_length_validation(self):
        long_query = "What is Bharatanatyam? " * 50  # > 1000 chars
        with self.assertRaises(HTTPException) as ctx:
            guru_chat(GuruChatRequest(message=long_query))
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("exceeds maximum limit", ctx.exception.detail)

    def test_api_endpoint_success(self):
        res = guru_chat(GuruChatRequest(message="What is Aramandi?"))
        self.assertIn("Aramandi", res["answer"])
        self.assertEqual(res["validation_status"], "guru-review-required")

if __name__ == "__main__":
    unittest.main()
