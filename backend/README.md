# NrityaVaani - AI & Neural Audio Backend Service

High-performance [FastAPI](https://fastapi.tiangolo.com/) microservice providing on-demand **Goonj-1-82M** 3D Guru neural speech synthesis, classical dance acoustic modulation, and computer vision mudra inference.

---

## Architectural Overview

```
backend/
├── core/
│   ├── goonj_tts.py       # Goonj-1-82M / Kokoro neural TTS synthesis & caching engine
│   └── classification.py  # Mathematical kinematic gesture classifier
├── models/                # Trained neural network weights (*.pt, *.onnx, *.tflite)
├── main.py                # FastAPI application entrypoint & REST API endpoints
├── requirements.txt       # Production Python dependencies
└── README.md              # Backend documentation
```

### Key Responsibilities
1. **Goonj 3D Guru Voice Engine**: Synthesizes authentic Indian pedagogical voice cues across 15 Guru personas and 12 languages with custom pitch, rate, and timbre adjustments.
2. **Audio Stream Caching**: Low-latency memory & disk caching for synthesized MP3 speech buffers to reduce latency on repeated cues.
3. **Mudra Kinematic Analysis**: Evaluates 21 3D hand skeletal landmark coordinates sent from client devices.
4. **Deployable Anywhere**: Configured for continuous execution on **Render** (via root `render.yaml`), Docker containers, or local development.

---

## Quickstart and Local Setup

### Prerequisites
* **Python 3.10+** (Python 3.10.13 recommended)
* `pip` and virtual environment support

### 1. Virtual Environment Setup
```bash
# Navigate to the backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Run the Development Server
```bash
# Start with hot-reloading on port 8000
uvicorn main:app --reload --port 8000
```

> **Note**: You can also run the server from the repository root using `uvicorn main:app --reload --port 8000`.

### 3. Verify Server Status
* **Service Root**: [http://localhost:8000/](http://localhost:8000/)
* **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## API Endpoints

### 1. Health & Service Metadata
`GET /`

**Response (`200 OK`)**:
```json
{
  "status": "online",
  "message": "NrityaVaani AI API with Goonj 3D Guru TTS is running",
  "tts_personas_count": 15,
  "supported_languages_count": 12
}
```

---

### 2. Goonj Personas Directory
`GET /api/tts/personas`

Returns all 15 classical master archetypes and modern instructor profiles.

**Response (`200 OK`)**:
```json
{
  "personas": [
    {
      "id": "hi_meera",
      "name": "Guru Meera",
      "gender": "female",
      "primaryLang": "hi",
      "tone": "Warm, Compassionate & Emotive",
      "description": "Vocal classical guru with deep traditional expression.",
      "badge": "Classical Hindi"
    },
    ...
  ],
  "default": "hi_meera"
}
```

---

### 3. Supported Languages
`GET /api/tts/languages`

Returns the list of supported classical, regional, and national languages.

---

### 4. Neural Speech Synthesis
`POST /api/tts/speak`

Synthesizes high-fidelity pedagogical cues using specified Guru persona acoustics.

**Request Body (`application/json`)**:
```json
{
  "text": "Keep your palm flat and extend all four fingers upwards for Pataka mudra.",
  "persona": "en_priya",
  "lang": "en",
  "speed": 1.0
}
```

**Response (`200 OK`)**:
* Content-Type: `audio/mpeg`
* Headers:
  * `X-TTS-Persona: en_priya`
  * `X-TTS-Engine: Goonj-Kokoro-Neural`

---

### 5. Mudra Landmark Evaluation
`POST /predict`

Analyzes 21 3D hand landmarks for real-time posture scoring.

**Request Body (`application/json`)**:
```json
{
  "landmarks": [
    {"x": 0.51, "y": 0.62, "z": -0.01},
    ...
  ],
  "handedness": "Right"
}
```

**Response (`200 OK`)**:
```json
{
  "name": "Pataka",
  "confidence": 0.95,
  "feedback": "Excellent posture. Keep your palm flat."
}
```

---

## Deployment on Render.com

The backend is fully configured for Render via the root [`render.yaml`](../render.yaml) blueprint:

1. Connect your repository to **[Render.com](https://render.com)**.
2. Select **New +** → **Blueprint** and select `divycoders/NrityaVaani`.
3. Render automatically picks up `render.yaml` and deploys as a **Free Web Service**.
4. The service URL (e.g., `https://nrityavaani-backend.onrender.com`) provides full HTTPS endpoints with CORS enabled for the Netlify frontend.

### Environment Variables
| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `10000` | Port assigned dynamically by Render or local environment |
| `PYTHON_VERSION` | `3.10.13` | Python runtime version on Render |
| `AUDIO_CACHE_DIR` | `./cache/audio` | Optional override path for cached MP3 audio files |
