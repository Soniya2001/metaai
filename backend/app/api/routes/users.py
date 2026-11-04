"""Users and user preferences router."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserPreferencesUpdate
from app.core.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    """Fetch current logged-in user details."""
    return current_user

@router.patch("/me", response_model=UserResponse)
def update_current_user(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates profile information (full name, username, bio, avatar)."""
    if update_data.username is not None:
        new_username = update_data.username.strip().lower()
        if new_username != current_user.username:
            existing = db.query(User).filter(User.username == new_username).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This username is already taken.",
                )
            current_user.username = new_username

    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name.strip()
    if update_data.bio is not None:
        current_user.bio = update_data.bio.strip()
    if update_data.avatar is not None:
        current_user.avatar = update_data.avatar.strip()

    db.commit()
    db.refresh(current_user)
    return current_user

@router.patch("/me/preferences", response_model=UserResponse)
def update_user_preferences(
    prefs: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Updates translation and audio playback preferences."""
    if prefs.preferred_language is not None:
        current_user.preferred_language = prefs.preferred_language
    if prefs.auto_translate_enabled is not None:
        current_user.auto_translate_enabled = prefs.auto_translate_enabled
    if prefs.show_transcript is not None:
        current_user.show_transcript = prefs.show_transcript
    if prefs.translated_audio_enabled is not None:
        current_user.translated_audio_enabled = prefs.translated_audio_enabled

    db.commit()
    db.refresh(current_user)
    return current_user

