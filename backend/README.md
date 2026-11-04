# EchoPulse AI Messaging — Backend & Meta AI Integration

Backend service for the **EchoPulse** multilingual voice-messaging application, powered by FastAPI and the official **Meta Model API**:
- **Meta Muse Voice Transcribe 1.0** for Speech-to-Text (ASR)
- **Meta Muse Spark 1.3** for nuanced, dialect-aware cross-lingual translation
- Modular Text-to-Speech (TTS) architecture

---

## 🏗️ Architecture

```
backend/
├── app/
│   ├── main.py                  # FastAPI application entrypoint & middleware
│   ├── core/
│   │   ├── config.py            # Pydantic Settings & environment variables
│   │   └── security.py          # Password hashing (bcrypt) & JWT token handling
│   ├── api/
│   │   └── routes/              # Modular API endpoints (auth, users, conversations, messages, translation)
│   ├── models/                  # SQLAlchemy models (User, Conversation, Message)
│   ├── schemas/                 # Pydantic request & response validation schemas
│   ├── services/
│   │   ├── meta_transcription.py# Meta Muse Voice Transcribe 1.0 client
│   │   ├── meta_translation.py  # Meta Muse Spark 1.3 prompt & translation reasoning
│   │   ├── translation_pipeline.py # Complete 6-step voice translation workflow
│   │   ├── tts_provider.py      # Abstract TTS provider adapter
│   │   └── audio_storage.py     # Audio persistence & storage abstraction
│   ├── db/
│   │   └── database.py          # SQLAlchemy session & SQLite/PostgreSQL engine
│   └── utils/
│       └── audio_validation.py  # Audio MIME type & payload size validation
├── tests/                       # Pytest test suite with mocked & live test modes
├── uploads/                     # Local storage for original & translated audio
├── .env.example                 # Example environment variables
└── requirements.txt             # Backend dependencies
```

---

## ⚙️ Environment Variables

Create `.env` in `backend/`:

```env
MODEL_API_KEY=your_meta_model_api_key_here
META_TRANSLATION_MODEL=muse-spark-1.3
META_TRANSCRIPTION_MODEL=muse-voice-transcribe-1.0
META_API_BASE_URL=https://api.meta.ai/v1

SECRET_KEY=change_this_to_a_secure_random_key_in_production
DATABASE_URL=sqlite:///./echopulse.db
UPLOAD_DIR=./uploads
TTS_PROVIDER=browser_delegated
```

---

## 🚀 Running the Backend

From the project root:

```powershell
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

The interactive OpenAPI docs will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/api/health`

---

## 🧪 Running Tests

```powershell
python -m pytest backend/tests -v
```

