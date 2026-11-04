"""Conversation schemas."""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.message import MessageResponse

class ConversationCreate(BaseModel):
    participant_user_ids: List[str] = Field(..., min_length=1)

class ParticipantSummary(BaseModel):
    user_id: str
    username: str
    full_name: str
    avatar: Optional[str] = None
    preferred_language: str
    is_online: bool = True

class ConversationResponse(BaseModel):
    id: str
    participants: List[ParticipantSummary]
    last_message: Optional[MessageResponse] = None
    unread_count: int = 0
    created_at: datetime
    updated_at: datetime

