"""Translation management router."""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.db.database import get_db
from app.models.user import User
from app.models.message import Message
from app.models.conversation import ConversationParticipant
from app.schemas.message import MessageResponse
from app.core.security import get_current_user
from app.services.translation_pipeline import execute_voice_translation_pipeline

router = APIRouter(prefix="/messages", tags=["Translation"])

class TranslateRequest(BaseModel):
    target_language: Optional[str] = None

def format_message_response(msg: Message) -> MessageResponse:
    return MessageResponse(
        id=msg.id,
        conversation_id=msg.conversation_id,
        sender_id=msg.sender_id,
        message_type=msg.message_type,
        original_text=msg.original_text,
        original_transcript=msg.original_transcript,
        detected_language=msg.detected_language,
        translated_text=msg.translated_text,
        target_language=msg.target_language,
        translation_status=msg.translation_status,
        audio_duration=msg.audio_duration,
        has_original_audio=bool(msg.original_audio_path),
        has_translated_audio=bool(msg.translated_audio_path),
        created_at=msg.created_at,
        updated_at=msg.updated_at,
    )

@router.post("/{message_id}/translate", response_model=MessageResponse)
async def trigger_translation(
    message_id: str,
    background_tasks: BackgroundTasks,
    payload: Optional[TranslateRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Triggers or retries the AI transcription & translation pipeline for a voice message."""
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found.")

    # Verify authorization
    part = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == msg.conversation_id,
        ConversationParticipant.user_id == current_user.id,
    ).first()
    if not part:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized access.")

    target_lang = payload.target_language if payload and payload.target_language else current_user.preferred_language
    msg.translation_status = "processing"
    db.commit()

    # Schedule pipeline execution
    background_tasks.add_task(execute_voice_translation_pipeline, message_id, target_lang)

    return format_message_response(msg)

@router.get("/{message_id}/translation")
def get_translation_status(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves current translation progress, transcripts, and language metadata."""
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found.")

    part = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == msg.conversation_id,
        ConversationParticipant.user_id == current_user.id,
    ).first()
    if not part:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized access.")

    return {
        "message_id": msg.id,
        "status": msg.translation_status,
        "detected_source_language": msg.detected_language,
        "original_transcript": msg.original_transcript,
        "target_language": msg.target_language,
        "translated_text": msg.translated_text,
        "has_translated_audio": bool(msg.translated_audio_path),
    }

