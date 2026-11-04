"""Database initialization and demo seeding module."""
import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.db.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.conversation import Conversation, ConversationParticipant
from app.models.message import Message
from app.core.security import get_password_hash

logger = logging.getLogger("echopulse.db")

def init_db():
    """Initializes tables and populates seed data if empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if users already exist
        existing = db.query(User).first()
        if existing:
            return

        logger.info("Seeding initial demo contacts and conversations into database...")

        # 1. Primary demo user
        me = User(
            id="user-me",
            username="devanathan_s",
            full_name="Devanathan S.",
            email="devanathan@echopulse.ai",
            password_hash=get_password_hash("password123"),
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            bio="Product Engineer • Building multilingual bridges with voice AI",
            preferred_language="English",
            auto_translate_enabled=True,
            show_transcript=True,
            translated_audio_enabled=True,
        )
        db.add(me)

        # 2. Demo Contacts
        contacts_data = [
            {
                "id": "contact-ananya",
                "username": "ananya_m",
                "full_name": "Ananya",
                "email": "ananya.m@gmail.com",
                "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                "bio": "Design researcher & classical vocalist",
                "preferred_language": "Tamil",
            },
            {
                "id": "contact-rahul",
                "username": "rahul_verma",
                "full_name": "Rahul",
                "email": "rahul.v@techcorp.io",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "bio": "Fullstack Architect & coffee enthusiast",
                "preferred_language": "Hindi",
            },
            {
                "id": "contact-mom",
                "username": "amma_home",
                "full_name": "Mom",
                "email": "amma@family.net",
                "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
                "bio": "Family First ❤️ Always here",
                "preferred_language": "Telugu",
            },
            {
                "id": "contact-priya",
                "username": "priya_k",
                "full_name": "Priya",
                "email": "priya.k@designlab.org",
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "bio": "Product Designer @ Studio One",
                "preferred_language": "Kannada",
            },
            {
                "id": "contact-arjun",
                "username": "arjun_patel",
                "full_name": "Arjun",
                "email": "arjun.p@investors.vc",
                "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                "bio": "Angel Investor & Advisor",
                "preferred_language": "Bengali",
            },
        ]

        created_contacts = []
        for cd in contacts_data:
            contact_user = User(
                id=cd["id"],
                username=cd["username"],
                full_name=cd["full_name"],
                email=cd["email"],
                password_hash=get_password_hash("password123"),
                avatar=cd["avatar"],
                bio=cd["bio"],
                preferred_language=cd["preferred_language"],
                auto_translate_enabled=True,
                show_transcript=True,
                translated_audio_enabled=True,
            )
            db.add(contact_user)
            created_contacts.append(contact_user)
        db.commit()

        # 3. Create Conversations & Initial Messages
        now = datetime.now(timezone.utc)

        # Ananya Conversation
        conv_ananya = Conversation(id="conv-ananya", created_at=now - timedelta(hours=2))
        db.add(conv_ananya)
        db.flush()
        db.add(ConversationParticipant(conversation_id=conv_ananya.id, user_id=me.id))
        db.add(ConversationParticipant(conversation_id=conv_ananya.id, user_id="contact-ananya"))

        db.add(Message(
            id="msg-ananya-1",
            conversation_id=conv_ananya.id,
            sender_id=me.id,
            message_type="text",
            original_text="Hey Ananya, are we still meeting this evening to review the designs?",
            translation_status="completed",
            created_at=now - timedelta(minutes=40),
        ))
        db.add(Message(
            id="msg-ananya-2",
            conversation_id=conv_ananya.id,
            sender_id="contact-ananya",
            message_type="text",
            original_text="Yes! Just got caught in a quick sprint wrap-up.",
            translation_status="completed",
            created_at=now - timedelta(minutes=35),
        ))
        db.add(Message(
            id="msg-ananya-3",
            conversation_id=conv_ananya.id,
            sender_id="contact-ananya",
            message_type="voice",
            original_transcript="நான் 7 மணிக்குள்ள வீட்டுக்கு வந்துடுவேன். சீக்கிரம் பார்க்கலாம்!",
            detected_language="Tamil",
            translated_text="I'll reach home by 7 PM. See you soon!",
            target_language="English",
            audio_duration=12.0,
            translation_status="completed",
            created_at=now - timedelta(minutes=2),
        ))

        # Rahul Conversation
        conv_rahul = Conversation(id="conv-rahul", created_at=now - timedelta(hours=4))
        db.add(conv_rahul)
        db.flush()
        db.add(ConversationParticipant(conversation_id=conv_rahul.id, user_id=me.id))
        db.add(ConversationParticipant(conversation_id=conv_rahul.id, user_id="contact-rahul"))

        db.add(Message(
            id="msg-rahul-1",
            conversation_id=conv_rahul.id,
            sender_id="contact-rahul",
            message_type="voice",
            original_transcript="कल सुबह 10 बजे हमारी क्लाइंट के साथ डेमो मीटिंग है, याद रखना।",
            detected_language="Hindi",
            translated_text="Remember, we have our client demo meeting tomorrow at 10 AM.",
            target_language="English",
            audio_duration=9.0,
            translation_status="completed",
            created_at=now - timedelta(minutes=45),
        ))

        # Arjun Conversation
        conv_arjun = Conversation(id="conv-arjun", created_at=now - timedelta(days=1))
        db.add(conv_arjun)
        db.flush()
        db.add(ConversationParticipant(conversation_id=conv_arjun.id, user_id=me.id))
        db.add(ConversationParticipant(conversation_id=conv_arjun.id, user_id="contact-arjun"))

        db.add(Message(
            id="msg-arjun-1",
            conversation_id=conv_arjun.id,
            sender_id="contact-arjun",
            message_type="voice",
            original_transcript="আপনার পিচ ডেকটি চমৎকার লেগেছে। আসুন শুক্রবার বিস্তারিত আলোচনা করি।",
            detected_language="Bengali",
            translated_text="I found your pitch deck impressive. Let us discuss the details this Friday.",
            target_language="English",
            audio_duration=18.0,
            translation_status="completed",
            created_at=now - timedelta(hours=18),
        ))

        db.commit()
        logger.info("Database seeding complete!")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

