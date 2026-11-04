"""Modular Text-to-Speech (TTS) Provider Architecture."""
import logging
import uuid
from abc import ABC, abstractmethod
from typing import Optional
from app.core.config import settings
from app.services.audio_storage import audio_storage

logger = logging.getLogger("echopulse.tts")

class BaseTTSProvider(ABC):
    """Abstract interface for replaceable Text-to-Speech engines."""

    @abstractmethod
    async def generate_speech(
        self, text: str, language: str, voice_style: Optional[str] = None
    ) -> Optional[str]:
        """
        Synthesizes text into speech.
        Returns the saved filename in audio storage or None if delegation/fallback is used.
        """
        pass

class BrowserDelegatedTTSProvider(BaseTTSProvider):
    """
    Default provider that coordinates with the frontend client.
    Delegates speech synthesis to the client's high-fidelity Web Speech API,
    avoiding unnecessary external server TTS charges or latency.
    """
    async def generate_speech(
        self, text: str, language: str, voice_style: Optional[str] = None
    ) -> Optional[str]:
        logger.info(f"Delegating TTS playback to browser client engine for language '{language}'.")
        return None

class LocalWavTTSProvider(BaseTTSProvider):
    """Generates a valid PCM WAV audio file locally for audio pipeline verification."""
    async def generate_speech(
        self, text: str, language: str, voice_style: Optional[str] = None
    ) -> Optional[str]:
        # Generate valid 16kHz Mono PCM WAV
        import math
        sample_rate = 16000
        duration_sec = min(max(2.0, len(text) * 0.06), 10.0)
        num_samples = int(sample_rate * duration_sec)
        byte_data = bytearray(44 + num_samples * 2)

        # RIFF header
        byte_data[0:4] = b"RIFF"
        file_len = 36 + num_samples * 2
        byte_data[4:8] = file_len.to_bytes(4, "little")
        byte_data[8:12] = b"WAVE"
        byte_data[12:16] = b"fmt "
        byte_data[16:20] = (16).to_bytes(4, "little")
        byte_data[20:22] = (1).to_bytes(2, "little")  # PCM
        byte_data[22:24] = (1).to_bytes(2, "little")  # Mono
        byte_data[24:28] = sample_rate.to_bytes(4, "little")
        byte_data[28:32] = (sample_rate * 2).to_bytes(4, "little")
        byte_data[32:34] = (2).to_bytes(2, "little")
        byte_data[34:36] = (16).to_bytes(2, "little")
        byte_data[36:40] = b"data"
        byte_data[40:44] = (num_samples * 2).to_bytes(4, "little")

        for i in range(num_samples):
            val = int(math.sin(i / sample_rate * 440 * 2 * math.pi) * 3000)
            offset = 44 + i * 2
            byte_data[offset:offset+2] = val.to_bytes(2, "little", signed=True)

        filename = f"tts_{uuid.uuid4().hex}.wav"
        audio_storage.save_audio(filename, bytes(byte_data))
        return filename

def get_tts_provider() -> BaseTTSProvider:
    provider_name = settings.TTS_PROVIDER.lower().strip()
    if provider_name == "local":
        return LocalWavTTSProvider()
    return BrowserDelegatedTTSProvider()

tts_provider = get_tts_provider()
