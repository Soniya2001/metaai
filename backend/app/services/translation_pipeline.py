"""End-to-End Voice Message Translation Pipeline."""
import logging
from datetime import datetime, timezone
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.message import Message
from app.models.user import User
from app.models.conversation import ConversationParticipant
from app.services.audio_storage import audio_storage
from app.services.meta_transcription import meta_transcriber
from app.services.meta_translation import meta_translator
from app.services.tts_provider import tts_provider
from app.db.database import SessionLocal

logger = logging.getLogger("echopulse.pipeline")

async def execute_voice_translation_pipeline(message_id: str, force_target_lang: str = None) -> bool:
    """
    Executes the 6-step voice translation workflow for a given message record.
    Can be run as a background task or synchronous call.
    """
    db: Session = SessionLocal()
    try:
        msg = db.query(Message).filter(Message.id == message_id).first()
        if not msg or msg.message_type != "voice":
            logger.error(f"Cannot process message {message_id}: Invalid message or not voice type.")
            return False

        msg.translation_status = "processing"
        db.commit()

        # Step 1: Locate original audio
        if not msg.original_audio_path:
            msg.translation_status = "failed"
            db.commit()
            return False

        abs_audio_path = audio_storage.get_audio_path(msg.original_audio_path)

        # Step 2: Transcribe Audio using Meta Muse Voice Transcribe
        try:
            asr_res = await meta_transcriber.transcribe_audio(abs_audio_path)
            msg.original_transcript = asr_res.get("transcript", "")
            msg.detected_language = asr_res.get("detected_language", "Unknown")
        except Exception as e:
            logger.error(f"Transcription failed for message {message_id}: {e}")
            msg.translation_status = "transcription_failed"
            db.commit()
            return False

        # Step 3: Determine Target Language
        target_lang = force_target_lang
        if not target_lang:
            recipients = (
                db.query(User)
                .join(ConversationParticipant, ConversationParticipant.user_id == User.id)
                .filter(
                    ConversationParticipant.conversation_id == msg.conversation_id,
                    User.id != msg.sender_id,
                )
                .all()
            )
            target_lang = recipients[0].preferred_language if recipients else "English"
        
        msg.target_language = target_lang

        # Step 4: Translate using Meta Muse Spark 1.3
        try:
            trans_res = await meta_translator.translate_text(
                text=msg.original_transcript,
                target_language=target_lang,
                source_language_hint=msg.detected_language,
            )
            msg.translated_text = trans_res.get("translated_text", "")
        except Exception as e:
            logger.error(f"Translation failed for message {message_id}: {e}")
            msg.translation_status = "translation_failed"
            db.commit()
            return False

        # Step 5: Text-to-Speech Synthesis
        try:
            tts_file = await tts_provider.generate_speech(
                text=msg.translated_text,
                language=target_lang,
            )
            if tts_file:
                msg.translated_audio_path = tts_file
        except Exception as e:
            logger.warning(f"TTS audio synthesis notice for message {message_id}: {e}")
            # Non-fatal: translated text is preserved even if TTS fails

        # Step 6: Mark Completed
        msg.translation_status = "completed"
        msg.updated_at = datetime.now(timezone.utc)
        db.commit()
        logger.info(f"Voice translation pipeline completed successfully for message {message_id}.")
        return True

    except Exception as e:
        logger.error(f"Unexpected pipeline failure for message {message_id}: {e}", exc_info=True)
        try:
            msg = db.query(Message).filter(Message.id == message_id).first()
            if msg:
                msg.translation_status = "failed"
                db.commit()
        except Exception:
            pass
        return False
    finally:
        db.close()

