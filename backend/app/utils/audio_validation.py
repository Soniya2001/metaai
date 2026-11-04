"""Audio file validation by magic bytes, MIME type, and size."""
import os
import uuid
from typing import Tuple
from fastapi import HTTPException, status
from app.core.config import settings

# Recognized audio magic signatures
MAGIC_SIGNATURES = {
    "wav": [(0, b"RIFF")],
    "webm": [(0, b"\x1a\x45\xdf\xa3")],
    "ogg": [(0, b"OggS")],
    "mp3": [(0, b"ID3"), (0, b"\xff\xfb"), (0, b"\xff\xf3"), (0, b"\xff\xf2")],
    "flac": [(0, b"fLaC")],
    "m4a": [(4, b"ftyp")],
}

ALLOWED_MIME_TYPES = {
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/webm",
    "audio/ogg",
    "audio/mpeg",
    "audio/mp3",
    "audio/flac",
    "audio/mp4",
    "audio/m4a",
    "audio/x-m4a",
    "video/webm",  # Many browser MediaRecorders record audio inside a WebM container with video/webm mime
}

def detect_audio_format_from_bytes(data: bytes) -> str:
    """Inspects header magic bytes to verify genuine audio format."""
    if len(data) < 12:
        return ""
    
    # Check WAV specifically (RIFF ... WAVE)
    if data.startswith(b"RIFF") and data[8:12] == b"WAVE":
        return "wav"
        
    for fmt, sigs in MAGIC_SIGNATURES.items():
        for offset, sig in sigs:
            if len(data) >= offset + len(sig):
                if data[offset:offset+len(sig)] == sig:
                    return fmt
    return ""

def validate_audio_upload(content: bytes, content_type: str, filename: str) -> Tuple[str, str]:
    """
    Validates audio byte size, declared MIME type, and binary signature.
    Returns (detected_extension, safe_unique_filename).
    """
    file_size = len(content)
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded audio file is empty (0 bytes).",
        )
        
    if file_size > settings.MAX_AUDIO_SIZE_BYTES:
        raise HTTPException(
            status_code=getattr(status, "HTTP_413_CONTENT_TOO_LARGE", 413),
            detail=f"Audio file exceeds maximum allowed size of {settings.MAX_AUDIO_SIZE_BYTES // (1024 * 1024)}MB.",
        )

    # Clean mime check
    base_mime = content_type.split(";")[0].strip().lower()
    if base_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported audio MIME type: '{content_type}'. Allowed: WAV, WebM, MP3, OGG, M4A, FLAC.",
        )

    # Magic bytes verification
    detected_format = detect_audio_format_from_bytes(content)
    if not detected_format:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid audio binary signature. File content does not match genuine audio signatures.",
        )

    # Generate safe unique filename
    safe_name = f"{uuid.uuid4().hex}.{detected_format}"
    return detected_format, safe_name
