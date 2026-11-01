"""
Guru Assistant Core Module for FastAPI Backend.

NOTE ON ARCHITECTURE (Phase 7):
The authoritative production conversational assistant endpoint used by the NrityaVaani
React UI is the Next.js API route (/api/guru/chat), which has direct typed access
to the full TypeScript curriculum database, 28 mudras, and provenance registry.

This Python module serves as a secondary backend service mirror and test harness endpoint
providing consistent responses and identical validation schemas:
- source-supported
- guru-review-required
- in-production
- unsupported (out-of-scope)
"""

from typing import Dict, Any, Optional

CURRICULUM_CONCEPTS = {
    "aramandi": {
        "title": "Aramandi (Ayata Mandala)",
        "definition": "The foundational demi-plié half-sitting posture where knees open laterally in a diamond shape while maintaining an upright spine.",
        "turnout_cue": "Turnout must originate from the natural external rotation of the hip joints, not forced at the knees or ankles. Never force a 180° stance through pain.",
        "tradition": "Kalakshetra teaches heels separated by approximately two to three fingers' width; older Tanjavur styles often join heels.",
        "mistake": "Allowing knees to cave inward or leaning forward from the hips.",
        "validation": "guru-review-required",
        "status_label": "Guru Review Pending"
    },
    "samapada": {
        "title": "Samapada",
        "definition": "The upright standing posture with parallel feet together and naturally lengthened vertical spine.",
        "validation": "source-supported",
        "status_label": "Source-Supported"
    },
    "namaskaram": {
        "title": "Namaskaram (Bhumi Pranam)",
        "definition": "The sacred salutation danced before and after practice. It honors God, the Guru, and the assembly while asking Mother Earth's (Bhumi Devi) forgiveness before stamping.",
        "steps": "11 sequential steps with Guru Vandana Sanskrit shloka.",
        "validation": "source-supported",
        "status_label": "Source-Supported"
    },
    "thattadavu": {
        "title": "Thattadavu (Tatta Adavu)",
        "definition": "The first family of adavus derived from 'Tattu' (to strike with flat sole). Danced in Aramandi with hands on the waist (Kati Hastha) across 3 speeds in 8-beat Adi Tala.",
        "validation": "source-supported",
        "status_label": "Source-Supported"
    },
    "natta-adavu": {
        "title": "Natta Adavu",
        "definition": "The second adavu family derived from 'Nattu' (to plant firmly). Introduces heel strikes (Kutti Thattu), leg extensions, and sweeping Tripataka arms.",
        "status_note": "3D motion capture is in production awaiting Natyacharya studio recording; step theory and sollukattus are fully verified in the curriculum.",
        "validation": "in-production",
        "status_label": "Mocap In Production"
    },
    "pataka": {
        "title": "Pataka Hasta (Asamyukta Hasta)",
        "meaning": "Flag",
        "formation": "All fingers straight and pressed closely together; thumb bent slightly against the side of the palm.",
        "viniyoga": "Used to depict clouds, a forest, night, opening a door, or river.",
        "validation": "source-supported",
        "status_label": "Source-Supported"
    }
}

def answer_guru_question(
    query: str,
    current_lesson_slug: Optional[str] = None
) -> Dict[str, Any]:
    """Answers learner questions grounded in approved Bharatanatyam knowledge."""
    q = query.lower().strip()

    if not q:
        return {"error": "Question cannot be empty"}

    if len(q) > 500:
        return {"error": "Question exceeds maximum limit of 500 characters."}

    # Case 1: Tatta vs Natta Adavu comparison
    if ("tatta" in q or "thattadavu" in q) and ("natta" in q or "nattadavu" in q):
        ans = (
            "**Tatta Adavu vs. Natta Adavu**:\n"
            "- **Tatta Adavu** ('Tattu' = to strike) consists purely of flat-sole stamps in Aramandi with hands anchored on the waist (Kati Hastha) across 3 speeds.\n"
            "- **Natta Adavu** ('Nattu' = to plant firmly) introduces heel strikes (Kutti Thattu), leg extensions, and sweeping Tripataka arm extensions.\n"
            "- In NrityaVaani, Tatta Adavu has a verified 3D motion take, while Natta Adavu's 3D motion is currently in production awaiting Natyacharya recording."
        )
        spoken = ans.replace("*", "").replace("\n", " ")
        return {
            "answer": ans,
            "spoken_text": spoken,
            "spokenText": spoken,
            "sources": ["Thattadavu (Tatta Adavu)", "Natta Adavu (Theory)"],
            "validation_status": "source-supported",
            "validationStatus": "source-supported",
            "status_label": "Source-Supported",
            "statusLabel": "Source-Supported",
            "tradition": "General / Pan-Bharatanatyam",
            "related_links": [
                {"title": "Thattadavu Lesson", "href": "/learn/bharatanatyam/thattadavu", "type": "lesson"},
                {"title": "Natta Adavu Curriculum", "href": "/learn/bharatanatyam/natta-adavu", "type": "lesson"}
            ],
            "relatedLinks": [
                {"title": "Thattadavu Lesson", "href": "/learn/bharatanatyam/thattadavu", "type": "lesson"},
                {"title": "Natta Adavu Curriculum", "href": "/learn/bharatanatyam/natta-adavu", "type": "lesson"}
            ]
        }

    # Case 2: Aramandi
    if "aramandi" in q or "ayata" in q or "turnout" in q:
        c = CURRICULUM_CONCEPTS["aramandi"]
        ans = (
            f"**{c['title']}**: {c['definition']}\n\n"
            f"• **Safety & Turnout**: {c['turnout_cue']}\n"
            f"• **Tradition Variation**: {c['tradition']}\n"
            f"• **Common Mistake**: {c['mistake']}\n\n"
            f"> ⚠️ **Pedagogical Advisory (Guru Review Pending)**: {c['turnout_cue']}"
        )
        spoken = ans.replace("*", "").replace("\n", " ").replace("> ⚠️", "")
        return {
            "answer": ans,
            "spoken_text": spoken,
            "spokenText": spoken,
            "sources": ["Abhinaya Darpana v. 261 (Ayata Mandala)", "Natya Shastra Ch. 10"],
            "validation_status": c["validation"],
            "validationStatus": c["validation"],
            "status_label": c["status_label"],
            "statusLabel": c["status_label"],
            "tradition": "General / Pan-Bharatanatyam",
            "safety_advisory": c["turnout_cue"],
            "safetyAdvisory": c["turnout_cue"],
            "related_links": [{"title": "Aramandi Lesson", "href": "/learn/bharatanatyam/samapada-and-aramandi", "type": "lesson"}],
            "relatedLinks": [{"title": "Aramandi Lesson", "href": "/learn/bharatanatyam/samapada-and-aramandi", "type": "lesson"}]
        }

    # Case 3: Natta Adavu only (In-Production topic)
    if ("natta" in q or "nattadavu" in q) and "tatta" not in q and "thattadavu" not in q:
        c = CURRICULUM_CONCEPTS["natta-adavu"]
        ans = (
            f"**{c['title']}**: {c['definition']}\n\n"
            f"> ℹ️ **Status Notice**: {c['status_note']}"
        )
        spoken = ans.replace("*", "").replace("\n", " ").replace("> ℹ️", "")
        return {
            "answer": ans,
            "spoken_text": spoken,
            "spokenText": spoken,
            "sources": ["Classical Adavu Taxonomy"],
            "validation_status": c["validation"],
            "validationStatus": c["validation"],
            "status_label": c["status_label"],
            "statusLabel": c["status_label"],
            "tradition": "General / Pan-Bharatanatyam",
            "related_links": [{"title": "Natta Adavu Curriculum", "href": "/learn/bharatanatyam/natta-adavu", "type": "lesson"}],
            "relatedLinks": [{"title": "Natta Adavu Curriculum", "href": "/learn/bharatanatyam/natta-adavu", "type": "lesson"}]
        }

    # Case 4: Pataka Hasta
    if "pataka" in q:
        c = CURRICULUM_CONCEPTS["pataka"]
        ans = (
            f"**{c['title']}** (Meaning: '{c['meaning']}'):\n"
            f"• **Formation**: {c['formation']}\n"
            f"• **Classical Viniyoga**: {c['viniyoga']}\n"
            f"• **Library Context**: Part of the 18 single-hand gestures currently modeled in NrityaVaani's 3D library."
        )
        spoken = ans.replace("*", "").replace("\n", " ")
        return {
            "answer": ans,
            "spoken_text": spoken,
            "spokenText": spoken,
            "sources": ["Abhinaya Darpana vv. 89–92"],
            "validation_status": c["validation"],
            "validationStatus": c["validation"],
            "status_label": c["status_label"],
            "statusLabel": c["status_label"],
            "tradition": "Abhinaya Darpana Canon",
            "related_links": [{"title": "Pataka Hasta 3D View", "href": "/library/pataka", "type": "mudra"}],
            "relatedLinks": [{"title": "Pataka Hasta 3D View", "href": "/library/pataka", "type": "mudra"}]
        }

    # Case 5: Namaskaram
    if "namaskaram" in q or "pranam" in q:
        c = CURRICULUM_CONCEPTS["namaskaram"]
        ans = (
            f"**{c['title']}**: {c['definition']}\n\n"
            f"• Consists of {c['steps']}\n"
            f"• Danced to ask Mother Earth's forgiveness before stamping during the dance."
        )
        spoken = ans.replace("*", "").replace("\n", " ")
        return {
            "answer": ans,
            "spoken_text": spoken,
            "spokenText": spoken,
            "sources": ["frontend/public/lessons/namaskaram/manifest.json", "Traditional Academy Syllabus"],
            "validation_status": c["validation"],
            "validationStatus": c["validation"],
            "status_label": c["status_label"],
            "statusLabel": c["status_label"],
            "tradition": "Kalakshetra Bani",
            "related_links": [{"title": "Namaskaram Lesson", "href": "/learn/bharatanatyam/namaskaram", "type": "lesson"}],
            "relatedLinks": [{"title": "Namaskaram Lesson", "href": "/learn/bharatanatyam/namaskaram", "type": "lesson"}]
        }

    # Case 6: Out of Scope
    dance_words = ["dance", "bharatanatyam", "adavu", "mudra", "hasta", "tala", "aramandi", "samapada", "step", "footwork", "posture"]
    if not any(w in q for w in dance_words):
        ans = (
            "As your 3D Virtual Guru, my teachings are strictly grounded in classical Bharatanatyam according to the Natya Shastra and Abhinaya Darpana. "
            "The topic you mentioned is not currently covered in our beginner curriculum. Please ask questions about our foundational postures, adavus, mudras, or rhythm concepts."
        )
        return {
            "answer": ans,
            "spoken_text": ans,
            "spokenText": ans,
            "sources": [],
            "validation_status": "unsupported",
            "validationStatus": "unsupported",
            "status_label": "Out of Scope",
            "statusLabel": "Out of Scope",
            "tradition": "General / Pan-Bharatanatyam",
            "related_links": [],
            "relatedLinks": []
        }

    # Default
    ans = (
        "Welcome! I am your 3D Virtual Guru. You can ask me about foundational stances like Aramandi, "
        "adavus like Tatta and Natta Adavu, single-hand and double-hand mudras, or rhythmic tala structures."
    )
    return {
        "answer": ans,
        "spoken_text": ans,
        "spokenText": ans,
        "sources": ["NrityaVaani Beginner Curriculum"],
        "validation_status": "source-supported",
        "validationStatus": "source-supported",
        "status_label": "Source-Supported",
        "statusLabel": "Source-Supported",
        "tradition": "General / Pan-Bharatanatyam",
        "related_links": [],
        "relatedLinks": []
    }
