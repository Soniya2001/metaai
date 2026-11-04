"""Meta Muse Voice Transcribe 1.0 Client Service."""
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("echopulse.asr")

class MetaTranscriptionService:
    def __init__(self):
        self.api_key = settings.MODEL_API_KEY
        self.base_url = settings.META_API_BASE_URL.rstrip("/")
        self.model = settings.META_TRANSCRIPTION_MODEL

    async def transcribe_audio(
        self, audio_path: Path, language_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Transcribes audio using Meta Muse Voice Transcribe 1.0 (POST /v1/asr/transcribe).
        Sends audio file via multipart/form-data.
        """
        if not audio_path.exists():
            raise FileNotFoundError(f"Audio file not found: {audio_path}")

        # If API key is configured, invoke the official Meta Model API
        if self.api_key and self.api_key.strip():
            headers = {
                "Authorization": f"Bearer {self.api_key}",
            }
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    with open(audio_path, "rb") as f:
                        files = {"file": (audio_path.name, f, "audio/wav")}
                        data = {"model": self.model}
                        if language_hint:
                            data["language"] = language_hint

                        response = await client.post(
                            f"{self.base_url}/asr/transcribe",
                            headers=headers,
                            files=files,
                            data=data,
                        )

                    if response.status_code == 200:
                        res_json = response.json()
                        return {
                            "transcript": res_json.get("text", res_json.get("transcript", "")),
                            "detected_language": res_json.get("detected_language", language_hint or "Unknown"),
                            "confidence": res_json.get("confidence", 0.95),
                            "is_real_api": True,
                        }
                    else:
                        logger.error(f"Meta ASR error ({response.status_code}): {response.text}")
                        raise RuntimeError(f"Meta Transcribe API error: {response.text}")
            except Exception as e:
                logger.error(f"Meta Transcribe request failed: {e}")
                raise e

        # Offline / Demo fallback when MODEL_API_KEY is not yet supplied by user
        logger.info(f"MODEL_API_KEY not configured. Using demo transcription adapter for: {audio_path.name}")
        return {
            "transcript": "Hello, this is a clear voice recording processed by EchoPulse.",
            "detected_language": language_hint or "English",
            "confidence": 0.90,
            "is_real_api": False,
            "notice": "Running with demo adapter. Configure MODEL_API_KEY in backend/.env for live cloud inference.",
        }

meta_transcriber = MetaTranscriptionService()
