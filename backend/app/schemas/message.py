"""Message request and response schemas."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class TextMessageCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    sender_id: str
    message_type: str
    original_text: Optional[str] = None
    original_transcript: Optional[str] = None
    detected_language: Optional[str] = None
    translated_text: Optional[str] = None
    target_language: Optional[str] = None
    translation_status: str
    audio_duration: Optional[float] = None
    has_original_audio: bool = False
    has_translated_audio: bool = False
    created_at: datetime
    updated_at: datetime

class VoiceUploadResponse(BaseModel):
    message: MessageResponse
    status: str
    audio_filename: str
    file_size_bytes: int
