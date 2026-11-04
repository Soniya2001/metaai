"""Phase 1 Backend Initialization Tests using in-process ASGI Transport."""
import pytest
import httpx
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_root_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["app"] == settings.PROJECT_NAME
        assert data["status"] == "online"

@pytest.mark.asyncio
async def test_api_health_endpoint():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["meta_transcription_model"] == "muse-voice-transcribe-1.0"
        assert data["meta_translation_model"] == "muse-spark-1.3"
