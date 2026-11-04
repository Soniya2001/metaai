"""Messages router (Text & Voice messaging with audio streaming)."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.db.database import get_db
from app.models.user import User
from app.models.conversation import Conversation, ConversationParticipant
from app.models.message import Message
from app.schemas.message import TextMessageCreate, MessageResponse, VoiceUploadResponse
from app.core.security import get_current_user
from app.utils.audio_validation import validate_audio_upload
from app.services.audio_storage import audio_storage
from app.services.translation_pipeline import execute_voice_translation_pipeline

router = APIRouter(tags=["Messages"])

def verify_conversation_participant(conversation_id: str, user_id: str, db: Session):
    """Verifies that user is a member of the conversation."""
    part = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id == user_id,
    ).first()
    if not part:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this conversation.",
        )

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

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetches all messages in a conversation for an authorized participant."""
    verify_conversation_participant(conversation_id, current_user.id, db)

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return [format_message_response(m) for m in messages]

@router.post("/conversations/{conversation_id}/messages/text", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_text_message(
    conversation_id: str,
    msg_in: TextMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sends a text message to a conversation."""
    verify_conversation_participant(conversation_id, current_user.id, db)

    new_msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        message_type="text",
        original_text=msg_in.text.strip(),
        translation_status="completed",
    )
    db.add(new_msg)

    # Update conversation timestamp
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conv:
        conv.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(new_msg)

    return format_message_response(new_msg)

@router.post("/conversations/{conversation_id}/messages/voice", response_model=VoiceUploadResponse, status_code=status.HTTP_201_CREATED)
async def send_voice_message(
    conversation_id: str,
    background_tasks: BackgroundTasks,
    audio_file: UploadFile = File(...),
    duration_seconds: Optional[float] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Receives multipart audio upload, validates format and magic bytes,
    persists original audio, and creates a message with 'pending' translation status.
    If auto-translation is enabled, automatically triggers background transcription & translation.
    """
    verify_conversation_participant(conversation_id, current_user.id, db)

    # Read binary content
    content = await audio_file.read()
    content_type = audio_file.content_type or "audio/wav"
    filename = audio_file.filename or "recording.wav"

    # Validate audio file format, size, and magic binary signatures
    detected_format, safe_filename = validate_audio_upload(content, content_type, filename)

    # Save to audio storage abstraction
    saved_rel_path = audio_storage.save_audio(safe_filename, content)

    # Identify recipient to know target preferred language
    recipients = (
        db.query(User)
        .join(ConversationParticipant, ConversationParticipant.user_id == User.id)
        .filter(
            ConversationParticipant.conversation_id == conversation_id,
            User.id != current_user.id,
        )
        .all()
    )
    target_lang = recipients[0].preferred_language if recipients else current_user.preferred_language
    auto_translate = recipients[0].auto_translate_enabled if recipients else True

    # Create message record in database with pending status
    new_msg = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        message_type="voice",
        original_audio_path=saved_rel_path,
        audio_duration=duration_seconds,
        target_language=target_lang,
        translation_status="pending",
    )
    db.add(new_msg)

    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conv:
        conv.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(new_msg)

    # If auto translation is enabled, trigger background pipeline
    if auto_translate:
        background_tasks.add_task(execute_voice_translation_pipeline, new_msg.id, target_lang)

    return VoiceUploadResponse(
        message=format_message_response(new_msg),
        status="pending",
        audio_filename=safe_filename,
        file_size_bytes=len(content),
    )

@router.get("/messages/{message_id}", response_model=MessageResponse)
def get_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves single message status and translation details."""
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found.")

    verify_conversation_participant(msg.conversation_id, current_user.id, db)
    return format_message_response(msg)

@router.get("/messages/{message_id}/audio/original")
def stream_original_audio(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Streams original uploaded audio recording securely for authorized conversation participants."""
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg or not msg.original_audio_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audio message not found.")

    verify_conversation_participant(msg.conversation_id, current_user.id, db)

    abs_path = audio_storage.get_audio_path(msg.original_audio_path)
    extension = abs_path.suffix.lstrip(".").lower()
    media_type = f"audio/{extension}"
    if extension == "mp3":
        media_type = "audio/mpeg"
    elif extension == "m4a":
        media_type = "audio/mp4"

    return FileResponse(abs_path, media_type=media_type)

@router.get("/messages/{message_id}/audio/translated")
def stream_translated_audio(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Streams synthesized translated audio if available."""
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg or not msg.translated_audio_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Translated audio not found or not yet generated.")

    verify_conversation_participant(msg.conversation_id, current_user.id, db)

    abs_path = audio_storage.get_audio_path(msg.translated_audio_path)
    return FileResponse(abs_path, media_type="audio/wav")

