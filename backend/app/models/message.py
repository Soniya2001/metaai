"""SQLAlchemy model for Message."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Message metadata
    message_type = Column(String(16), nullable=False)  # 'text' | 'voice'
    original_text = Column(Text, nullable=True)
    original_audio_path = Column(String(512), nullable=True)
    audio_duration = Column(Float, nullable=True)  # duration in seconds

    # Speech-to-Text & Translation fields
    original_transcript = Column(Text, nullable=True)
    detected_language = Column(String(32), nullable=True)
    translated_text = Column(Text, nullable=True)
    target_language = Column(String(32), nullable=True)
    translated_audio_path = Column(String(512), nullable=True)
    translation_status = Column(String(32), default="completed", nullable=False)  # 'pending', 'processing', 'completed', 'failed'

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", back_populates="messages")

