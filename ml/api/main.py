"""
main.py - FastAPI AI Service Boundary for PEAK Customer Support Chatbot.

Exposes the Phase 1 Chatbot over HTTP while:
1. Reusing model architecture and warm-up state initialized once at service startup.
2. Managing in-memory sessions that isolate conversation state without re-instantiating heavy models.
3. Providing Pydantic request validation and clean error handling.
4. Keeping the FastAPI layer strictly as a thin service boundary.
"""

import logging
import threading
import uuid
from contextlib import asynccontextmanager
from typing import Dict, Optional, Tuple

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from ml.src.chatbot import Chatbot

logger = logging.getLogger("peak_chatbot_api")


# ----------------------git rm -r --cached ml\api\__pycache__ ml\src\tools\__pycache__-----------------------------------------------------
# Session Management
# ---------------------------------------------------------------------------

class SessionManager:
    """
    Thread-safe in-memory session manager.
    Creates isolated Chatbot child instances per session via create_session_instance(),
    sharing the underlying Ollama client, classifier, response generator, and KB.
    """

    def __init__(self, root_bot: Chatbot) -> None:
        self._root_bot = root_bot
        self._sessions: Dict[str, Chatbot] = {}
        self._lock = threading.Lock()

    def get_or_create(self, session_id: Optional[str] = None) -> Tuple[str, Chatbot]:
        """
        Retrieves an existing session or creates a new isolated Chatbot instance.
        If session_id is not provided, a new unique UUID hex string is generated.
        """
        with self._lock:
            if not session_id:
                session_id = uuid.uuid4().hex
            if session_id not in self._sessions:
                logger.info(f"Creating new session instance: {session_id}")
                self._sessions[session_id] = self._root_bot.create_session_instance()
            return session_id, self._sessions[session_id]

    def reset(self, session_id: str) -> bool:
        """
        Resets conversation history and context for the given session_id.
        """
        with self._lock:
            if session_id in self._sessions:
                logger.info(f"Resetting conversation state for session: {session_id}")
                self._sessions[session_id].reset()
                return True
            # If session doesn't exist yet, create a fresh one
            self._sessions[session_id] = self._root_bot.create_session_instance()
            return True


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message to the chatbot")
    session_id: Optional[str] = Field(default=None, description="Optional conversation session ID")
    user_id: Optional[str] = Field(
        default=None,
        description="Authenticated customer ID from Node.js"
    )

    @field_validator("message")
    @classmethod
    def validate_message_non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("message must not be empty or whitespace only")
        return v.strip()

    @field_validator("session_id")
    @classmethod
    def validate_session_id(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_stripped = v.strip()
            return v_stripped if v_stripped else None
        return v

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_stripped = v.strip()
            return v_stripped if v_stripped else None
        return v


class ChatResponse(BaseModel):
    reply: str
    session_id: str


class ResetRequest(BaseModel):
    session_id: str = Field(..., description="Session ID to reset")

    @field_validator("session_id")
    @classmethod
    def validate_session_id_non_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("session_id must not be empty or whitespace only")
        return v.strip()


class ResetResponse(BaseModel):
    status: str = "ok"
    message: str = "Session reset successfully"
    session_id: str


class HealthResponse(BaseModel):
    status: str = "ok"
    model_ready: bool


# ---------------------------------------------------------------------------
# Application Lifecycle & State
# ---------------------------------------------------------------------------

_root_chatbot: Optional[Chatbot] = None
_session_manager: Optional[SessionManager] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Initializes the master Chatbot instance and triggers background warm-up
    once at application startup.
    """
    global _root_chatbot, _session_manager
    logger.info("Initializing root Chatbot and model architecture...")
    _root_chatbot = Chatbot()

    # Reuse existing background warm-up mechanism
    if not _root_chatbot.is_ready():
        logger.info("Triggering background warm-up for Gemma 3 4B...")
        _root_chatbot.start_background_warmup()
    else:
        logger.info("Model is already resident and ready.")

    _session_manager = SessionManager(root_bot=_root_chatbot)
    yield
    logger.info("Shutting down FastAPI AI Service...")


# ---------------------------------------------------------------------------
# FastAPI Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="PEAK AI Customer Support Service",
    description="FastAPI service exposing LLM-based customer support for PEAK E-Commerce",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get(
    "/api/health",
    response_model=HealthResponse,
    summary="Check service status and model readiness",
)
def health_check() -> HealthResponse:
    """
    Returns API health status and the actual readiness state of the underlying
    Gemma 3 4B model (via root_chatbot.is_ready()).
    """
    if _root_chatbot is None:
        return HealthResponse(status="ok", model_ready=False)
    return HealthResponse(status="ok", model_ready=_root_chatbot.is_ready())


@app.post(
    "/api/chat",
    response_model=ChatResponse,
    summary="Send a message to the customer support chatbot",
)
def chat(request: ChatRequest) -> ChatResponse:
    """
    Processes a user message through an isolated session instance of the Chatbot.
    Maintains bounded conversation history and context per session.
    """
    if _session_manager is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chat service is initializing. Please try again in a moment.",
        )

    session_id, bot = _session_manager.get_or_create(request.session_id)
    logger.info(f"Authenticated user ID received: {request.user_id}")
    reply = bot.process(request.message, user_id=request.user_id)

    return ChatResponse(
        reply=reply,
        session_id=session_id,
    )


@app.post(
    "/api/chat/reset",
    response_model=ResetResponse,
    summary="Reset conversation history for a given session",
)
def reset_session(request: ResetRequest) -> ResetResponse:
    """
    Resets the conversation state (history and context) for the given session_id.
    """
    if _session_manager is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chat service is initializing.",
        )

    _session_manager.reset(request.session_id)
    return ResetResponse(
        status="ok",
        message="Session reset successfully",
        session_id=request.session_id,
    )
