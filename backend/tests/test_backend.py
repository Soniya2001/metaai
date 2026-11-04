"""Comprehensive Test Suite for Phase 2 (Auth, DB, Users) & Phase 3 (Conversations, Messages, Voice Upload)."""
import uuid
import pytest
import httpx
from app.main import app
from app.core.config import settings

# Sample genuine WAV audio bytes header (RIFF....WAVEfmt )
GENUINE_WAV_BYTES = (
    b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00"
    b"\x88\x58\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
)

# Sample WebM audio bytes header (EBML ID \x1a\x45\xdf\xa3)
GENUINE_WEBM_BYTES = b"\x1a\x45\xdf\xa3\x9f\x42\x86\x81\x01\x42\xf7\x81\x01" + (b"\x00" * 30)

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.mark.asyncio
async def test_auth_registration_and_login():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        uid = uuid.uuid4().hex[:8]
        # 1. Register new user
        reg_payload = {
            "username": f"user_{uid}",
            "full_name": "Test User",
            "email": f"user_{uid}@example.com",
            "password": "securepassword123",
            "preferred_language": "Tamil",
        }
        res = await client.post("/api/auth/register", json=reg_payload)
        assert res.status_code == 201, res.text
        data = res.json()
        assert "access_token" in data
        assert "refresh_token" in data
        token = data["access_token"]

        # 2. Get profile with token
        headers = {"Authorization": f"Bearer {token}"}
        me_res = await client.get("/api/auth/me", headers=headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["username"] == f"user_{uid}"
        assert me_data["preferred_language"] == "Tamil"

        # 3. Login with credentials
        login_res = await client.post(
            "/api/auth/login",
            json={"username_or_email": f"user_{uid}", "password": "securepassword123"},
        )
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()

        # 4. Invalid credentials
        bad_login = await client.post(
            "/api/auth/login",
            json={"username_or_email": f"user_{uid}", "password": "wrongpassword"},
        )
        assert bad_login.status_code == 401

@pytest.mark.asyncio
async def test_protected_routes_require_auth():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Request without header
        res = await client.get("/api/users/me")
        assert res.status_code == 401

        # Request with bogus token
        res_bad = await client.get("/api/users/me", headers={"Authorization": "Bearer badtoken"})
        assert res_bad.status_code == 401

@pytest.mark.asyncio
async def test_user_preferences_update():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Login demo user
        login_res = await client.post(
            "/api/auth/login",
            json={"username_or_email": "devanathan_s", "password": "password123"},
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Update preferences
        pref_payload = {
            "preferred_language": "Hindi",
            "auto_translate_enabled": False,
            "show_transcript": True,
            "translated_audio_enabled": False,
        }
        res = await client.patch("/api/users/me/preferences", json=pref_payload, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["preferred_language"] == "Hindi"
        assert data["auto_translate_enabled"] is False
        assert data["translated_audio_enabled"] is False

@pytest.mark.asyncio
async def test_conversations_and_text_messaging():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Login
        login_res = await client.post(
            "/api/auth/login",
            json={"username_or_email": "devanathan_s", "password": "password123"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # List conversations
        convs_res = await client.get("/api/conversations", headers=headers)
        assert convs_res.status_code == 200
        convs = convs_res.json()
        assert len(convs) >= 1
        conv_id = convs[0]["id"]

        # Send text message
        msg_payload = {"text": "Hello, this is an automated integration test message."}
        send_res = await client.post(
            f"/api/conversations/{conv_id}/messages/text",
            json=msg_payload,
            headers=headers,
        )
        assert send_res.status_code == 201
        msg_data = send_res.json()
        assert msg_data["original_text"] == msg_payload["text"]
        assert msg_data["message_type"] == "text"
        assert msg_data["translation_status"] == "completed"

        # Fetch messages in conversation
        get_msgs_res = await client.get(f"/api/conversations/{conv_id}/messages", headers=headers)
        assert get_msgs_res.status_code == 200
        msgs = get_msgs_res.json()
        assert any(m["id"] == msg_data["id"] for m in msgs)

@pytest.mark.asyncio
async def test_voice_message_upload_and_validation():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Login
        login_res = await client.post(
            "/api/auth/login",
            json={"username_or_email": "devanathan_s", "password": "password123"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        convs_res = await client.get("/api/conversations", headers=headers)
        conv_id = convs_res.json()[0]["id"]

        # 1. Valid WAV Audio upload
        files = {"audio_file": ("test_recording.wav", GENUINE_WAV_BYTES, "audio/wav")}
        data = {"duration_seconds": "5.5"}
        upload_res = await client.post(
            f"/api/conversations/{conv_id}/messages/voice",
            files=files,
            data=data,
            headers=headers,
        )
        assert upload_res.status_code == 201, upload_res.text
        voice_res = upload_res.json()
        assert voice_res["status"] == "pending"
        message_id = voice_res["message"]["id"]

        # 2. Retrieve original audio stream
        stream_res = await client.get(f"/api/messages/{message_id}/audio/original", headers=headers)
        assert stream_res.status_code == 200
        assert stream_res.content == GENUINE_WAV_BYTES

        # 3. Invalid magic bytes rejection (fraudulent file disguised as wav)
        bad_files = {"audio_file": ("fake.wav", b"THIS_IS_NOT_AUDIO_DATA_AT_ALL!!", "audio/wav")}
        bad_res = await client.post(
            f"/api/conversations/{conv_id}/messages/voice",
            files=bad_files,
            headers=headers,
        )
        assert bad_res.status_code == 400
        assert "Invalid audio binary signature" in bad_res.json()["detail"]

        # 4. Oversized upload rejection
        oversized = {"audio_file": ("huge.wav", GENUINE_WAV_BYTES + (b"\x00" * (settings.MAX_AUDIO_SIZE_BYTES + 10)), "audio/wav")}
        over_res = await client.post(
            f"/api/conversations/{conv_id}/messages/voice",
            files=oversized,
            headers=headers,
        )
        assert over_res.status_code == 413

@pytest.mark.asyncio
async def test_unauthorized_conversation_access():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        uid = uuid.uuid4().hex[:8]
        # Register a third party user who is not in any conversation
        third_party = {
            "username": f"stranger_{uid}",
            "full_name": "Bob Stranger",
            "email": f"stranger_{uid}@example.com",
            "password": "password123",
        }
        reg_res = await client.post("/api/auth/register", json=third_party)
        assert reg_res.status_code == 201
        token = reg_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Try to access conv-ananya which stranger is NOT in
        res = await client.get("/api/conversations/conv-ananya", headers=headers)
        assert res.status_code == 403

        # Try to fetch messages from conv-ananya
        msg_res = await client.get("/api/conversations/conv-ananya/messages", headers=headers)
        assert msg_res.status_code == 403
