"""Audio storage service abstraction (Local storage with cloud-ready interface)."""
import os
from pathlib import Path
from typing import Optional
from fastapi import HTTPException, status
from app.core.config import settings

class AudioStorageService:
    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = Path(base_dir or settings.UPLOAD_DIR).resolve()
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_audio(self, filename: str, content: bytes) -> str:
        """Saves audio file content and returns the relative path."""
        target_path = (self.base_dir / filename).resolve()
        
        # Guard against path traversal
        if not str(target_path).startswith(str(self.base_dir)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Illegal file storage destination.",
            )
            
        with open(target_path, "wb") as f:
            f.write(content)
            
        return filename

    def get_audio_path(self, filename: str) -> Path:
        """Returns the absolute path to an audio file if it exists."""
        target_path = (self.base_dir / filename).resolve()
        if not str(target_path).startswith(str(self.base_dir)) or not target_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Requested audio file not found.",
            )
        return target_path

    def delete_audio(self, filename: str) -> bool:
        """Deletes an audio file if it exists."""
        try:
            target_path = (self.base_dir / filename).resolve()
            if target_path.exists():
                target_path.unlink()
                return True
        except Exception:
            pass
        return False

audio_storage = AudioStorageService()

