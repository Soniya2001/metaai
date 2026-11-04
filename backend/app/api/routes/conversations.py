"""Conversations router."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from app.db.database import get_db
from app.models.user import User
from app.models.conversation import Conversation, ConversationParticipant
from app.models.message import Message
from app.schemas.conversation import ConversationCreate, ConversationResponse, ParticipantSummary
from app.schemas.message import MessageResponse
from app.core.security import get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations"])

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

@router.get("", response_model=List[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists all conversations for the authenticated user."""
    # Find all conversation IDs user participates in
    participations = db.query(ConversationParticipant).filter(
        ConversationParticipant.user_id == current_user.id
    ).all()
    conversation_ids = [p.conversation_id for p in participations]

    conversations = (
        db.query(Conversation)
        .filter(Conversation.id.in_(conversation_ids))
        .order_by(Conversation.updated_at.desc())
        .all()
    )

    results = []
    for conv in conversations:
        # Load participants
        parts = (
            db.query(User)
            .join(ConversationParticipant, ConversationParticipant.user_id == User.id)
            .filter(ConversationParticipant.conversation_id == conv.id)
            .all()
        )
        
        participant_summaries = [
            ParticipantSummary(
                user_id=u.id,
                username=u.username,
                full_name=u.full_name,
                avatar=u.avatar,
                preferred_language=u.preferred_language,
                is_online=True,
            )
            for u in parts
        ]

        # Get latest message
        last_msg = (
            db.query(Message)
            .filter(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .first()
        )

        results.append(
            ConversationResponse(
                id=conv.id,
                participants=participant_summaries,
                last_message=format_message_response(last_msg) if last_msg else None,
                unread_count=0,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
            )
        )

    return results

@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conv_in: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Creates a new conversation with target participants."""
    # Collect unique participant IDs including current user
    all_participant_ids = list(set([current_user.id] + conv_in.participant_user_ids))

    # Verify all participant users exist
    users = db.query(User).filter(User.id.in_(all_participant_ids)).all()
    if len(users) != len(all_participant_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more participant users could not be found.",
        )

    # Check if a 1-on-1 conversation already exists between these two users
    if len(all_participant_ids) == 2:
        other_user_id = [uid for uid in all_participant_ids if uid != current_user.id][0]
        # Find conversations with both users
        user1_convs = {p.conversation_id for p in db.query(ConversationParticipant).filter(ConversationParticipant.user_id == current_user.id).all()}
        user2_convs = {p.conversation_id for p in db.query(ConversationParticipant).filter(ConversationParticipant.user_id == other_user_id).all()}
        common_convs = user1_convs.intersection(user2_convs)
        
        for c_id in common_convs:
            participant_count = db.query(ConversationParticipant).filter(ConversationParticipant.conversation_id == c_id).count()
            if participant_count == 2:
                # Existing 1-on-1 conversation found, return it
                existing_conv = db.query(Conversation).filter(Conversation.id == c_id).first()
                parts = [
                    ParticipantSummary(
                        user_id=u.id,
                        username=u.username,
                        full_name=u.full_name,
                        avatar=u.avatar,
                        preferred_language=u.preferred_language,
                    )
                    for u in users
                ]
                last_msg = db.query(Message).filter(Message.conversation_id == c_id).order_by(Message.created_at.desc()).first()
                return ConversationResponse(
                    id=existing_conv.id,
                    participants=parts,
                    last_message=format_message_response(last_msg) if last_msg else None,
                    unread_count=0,
                    created_at=existing_conv.created_at,
                    updated_at=existing_conv.updated_at,
                )

    new_conv = Conversation()
    db.add(new_conv)
    db.commit()
    db.refresh(new_conv)

    for u in users:
        part = ConversationParticipant(
            conversation_id=new_conv.id,
            user_id=u.id,
            joined_at=datetime.now(timezone.utc),
        )
        db.add(part)
    
    db.commit()

    parts = [
        ParticipantSummary(
            user_id=u.id,
            username=u.username,
            full_name=u.full_name,
            avatar=u.avatar,
            preferred_language=u.preferred_language,
        )
        for u in users
    ]

    return ConversationResponse(
        id=new_conv.id,
        participants=parts,
        last_message=None,
        unread_count=0,
        created_at=new_conv.created_at,
        updated_at=new_conv.updated_at,
    )

@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves a single conversation ensuring user is an authorized participant."""
    participant = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id == current_user.id,
    ).first()

    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this conversation.",
        )

    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    users = (
        db.query(User)
        .join(ConversationParticipant, ConversationParticipant.user_id == User.id)
        .filter(ConversationParticipant.conversation_id == conv.id)
        .all()
    )

    parts = [
        ParticipantSummary(
            user_id=u.id,
            username=u.username,
            full_name=u.full_name,
            avatar=u.avatar,
            preferred_language=u.preferred_language,
        )
        for u in users
    ]

    last_msg = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.desc()).first()

    return ConversationResponse(
        id=conv.id,
        participants=parts,
        last_message=format_message_response(last_msg) if last_msg else None,
        unread_count=0,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
    )

