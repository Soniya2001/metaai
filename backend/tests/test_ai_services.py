"""Tests for Meta AI Services (Transcribe, Spark Translation, and Pipeline)."""
import pytest
import httpx
from app.main import app
from app.services.meta_transcription import meta_transcriber
from app.services.meta_translation import meta_translator
from app.services.tts_provider import tts_provider
from app.services.audio_storage import audio_storage

GENUINE_WAV_BYTES = (
    b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00"
    b"\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
)

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.mark.asyncio
async def test_meta_transcription_service():
    # Save a temporary genuine wav file
    filename = "test_transcribe_sample.wav"
    audio_storage.save_audio(filename, GENUINE_WAV_BYTES)
    abs_path = audio_storage.get_audio_path(filename)

    res = await meta_transcriber.transcribe_audio(abs_path, language_hint="Tamil")
    assert "transcript" in res
    assert "detected_language" in res
    assert res["confidence"] > 0.0

@pytest.mark.asyncio
async def test_meta_translation_service_spark():
    # Test translation into Tamil
    res_tamil = await meta_translator.translate_text(
        text="I will reach home by 7 PM. See you soon!",
        target_language="Tamil",
        source_language_hint="English",
    )
    assert res_tamil["target_language"] == "Tamil"
    assert len(res_tamil["translated_text"]) > 0

    # Test identical language bypass
    res_same = await meta_translator.translate_text(
        text="Hello world",
        target_language="English",
        source_language_hint="English",
    )
    assert res_same["translated_text"] == "Hello world"

@pytest.mark.asyncio
async def test_tts_provider_adapter():
    tts_file = await tts_provider.generate_speech(
        text="This is a test speech synthesis",
        language="English",
    )
    # Default browser_delegated returns None so client handles it, local returns filename
    assert tts_file is None or tts_file.endswith(".wav")

@pytest.mark.asyncio
async def test_translation_endpoints():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Login
        login_res = await client.post(
            "/api/auth/login",
            json={"username_or_email": "devanathan_s", "password": "password123"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Trigger manual translation on demo voice message
        trans_res = await client.post(
            "/api/messages/msg-ananya-3/translate",
            json={"target_language": "Hindi"},
            headers=headers,
        )
        assert trans_res.status_code == 200
        data = trans_res.json()
        assert data["id"] == "msg-ananya-3"

        # 2. Get translation status
        status_res = await client.get("/api/messages/msg-ananya-3/translation", headers=headers)
        assert status_res.status_code == 200
        st_data = status_res.json()
        assert "status" in st_data
        assert "detected_source_language" in st_data
