"""User request and response schemas."""
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    username: str
    full_name: str
    email: EmailStr
    avatar: Optional[str] = None
    bio: Optional[str] = None
    preferred_language: str
    auto_translate_enabled: bool
    show_transcript: bool
    translated_audio_enabled: bool
    created_at: datetime

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None

class UserPreferencesUpdate(BaseModel):
    preferred_language: Optional[str] = None
    auto_translate_enabled: Optional[bool] = None
    show_transcript: Optional[bool] = None
    translated_audio_enabled: Optional[bool] = None
