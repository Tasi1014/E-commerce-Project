# ml/api/main.py

import logging
import uuid
from contextlib import asynccontextmanager
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ..src.chatbot import Chatbot


logger = logging.getLogger(__name__)


# ============================================================
# Session Management
# ============================================================

class SessionManager:
    """
    Maintains independent chatbot conversation states.

    The underlying classifier, response generator, and knowledge
    base can be shared because they are effectively stateless
    model/knowledge components.

    Conversation state itself belongs to each Chatbot session.
    """

    def __init__(self, root_chatbot: Chatbot):
        self.root_chatbot = root_chatbot
        self.sessions: Dict[str, Chatbot] = {}

    def get_or_create(
        self,
        session_id: Optional[str] = None,
    ) -> tuple[str, Chatbot]:

        if session_id and session_id in self.sessions:
            return session_id, self.sessions[session_id]

        new_session_id = session_id or str(uuid.uuid4())

        bot = self.root_chatbot.create_session_instance()

        self.sessions[new_session_id] = bot

        logger.info(
            "Created chatbot session: %s",
            new_session_id,
        )

        return new_session_id, bot

    def reset(self, session_id: str) -> bool:
        bot = self.sessions.get(session_id)

        if not bot:
            return False

        bot.reset()

        logger.info(
            "Reset chatbot session: %s",
            session_id,
        )

        return True


# ============================================================
# Request / Response Models
# ============================================================

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = None


class ChatResponse(BaseModel):
    """
    Response from the classification stage.

    For KB/social/out-of-scope requests:
        type = "response"
        reply contains the final response.

    For live-data requests:
        type = "tool_request"
        action tells Node which tool to execute.
        entities contains the extracted parameters.
    """

    type: str
    session_id: str

    reply: Optional[str] = None

    action: Optional[str] = None
    entities: Dict[str, Any] = {}

    classification: Optional[Dict[str, Any]] = None


class GenerateResponseRequest(BaseModel):
    """
    Request used after Node.js executes a live-data tool.

    Node sends the original message, the classification returned
    by Python, and the trusted tool result.
    """

    message: str
    session_id: str
    classification: Dict[str, Any]
    tool_result: Optional[Dict[str, Any]] = None


class GenerateResponse(BaseModel):
    type: str
    session_id: str
    reply: str


class ResetRequest(BaseModel):
    session_id: str


class ResetResponse(BaseModel):
    success: bool
    message: str


class HealthResponse(BaseModel):
    status: str


# ============================================================
# Application State
# ============================================================

_root_chatbot: Optional[Chatbot] = None
_session_manager: Optional[SessionManager] = None


# ============================================================
# Application Lifespan
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    global _root_chatbot
    global _session_manager

    logger.info("Initializing PEAK chatbot...")

    _root_chatbot = Chatbot()

    # Warm up the classifier/model once when the API starts.
    #
    # Session instances reuse the same classifier,
    # response generator, and knowledge base.
    _root_chatbot.warm_up()

    _session_manager = SessionManager(_root_chatbot)

    logger.info("PEAK chatbot API initialized successfully.")

    yield

    logger.info("Shutting down PEAK chatbot API...")

    _root_chatbot = None
    _session_manager = None


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="PEAK AI Customer Support",
    description="LLM-powered e-commerce customer support service.",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Helper Functions
# ============================================================

def get_session_manager() -> SessionManager:
    if _session_manager is None:
        raise HTTPException(
            status_code=503,
            detail="Chatbot service is not initialized.",
        )

    return _session_manager


# ============================================================
# Health Check
# ============================================================

@app.get(
    "/health",
    response_model=HealthResponse,
)
async def health_check():

    if _root_chatbot is None:
        return HealthResponse(status="initializing")

    return HealthResponse(status="ok")


# ============================================================
# Stage 1: Classify Customer Message
# ============================================================

@app.post(
    "/api/chat",
    response_model=ChatResponse,
)
async def classify_chat(request: ChatRequest):

    manager = get_session_manager()

    try:
        session_id, bot = manager.get_or_create(
            request.session_id
        )

        classification = bot.classify_message(
            request.message
        )

        intent = classification.get("intent")
        social_type = classification.get("social_type")

        logger.info(
            "Chat classification | session=%s | intent=%s | topic=%s | entities=%s",
            session_id,
            intent,
            classification.get("topic"),
            classification.get("entities"),
        )

        # ----------------------------------------------------
        # Social / out-of-scope messages
        # ----------------------------------------------------
        #
        # These do not require MongoDB.
        # They can be completed entirely inside Python.
        #
        if social_type or intent == "out_of_scope":

            reply = bot.generate_response(
                user_message=request.message,
                classification=classification,
            )

            return ChatResponse(
                type="response",
                session_id=session_id,
                reply=reply,
                entities=classification.get("entities") or {},
                classification=classification,
            )

        # ----------------------------------------------------
        # Live-data intents
        # ----------------------------------------------------
        #
        # Node.js must execute the actual database operation.
        #
        if intent in {
            "product_search",
            "order_tracking",
        }:

            return ChatResponse(
                type="tool_request",
                session_id=session_id,
                action=intent,
                entities=classification.get("entities") or {},
                classification=classification,
            )

        # ----------------------------------------------------
        # Knowledge-base intents
        # ----------------------------------------------------
        #
        # Python owns the static PEAK knowledge base.
        # Therefore Python retrieves the facts and performs
        # the second LLM call here.
        #
        if intent in {
            "payment_information",
            "purchase_return",
            "general_faq",
        }:

            reply = bot.generate_response(
                user_message=request.message,
                classification=classification,
            )

            return ChatResponse(
                type="response",
                session_id=session_id,
                reply=reply,
                entities=classification.get("entities") or {},
                classification=classification,
            )

        # ----------------------------------------------------
        # Unexpected intent
        # ----------------------------------------------------

        logger.warning(
            "Unexpected intent returned by classifier: %s",
            intent,
        )

        reply = bot.generate_response(
            user_message=request.message,
            classification=classification,
        )

        return ChatResponse(
            type="response",
            session_id=session_id,
            reply=reply,
            entities=classification.get("entities") or {},
            classification=classification,
        )

    except HTTPException:
        raise

    except Exception as error:
        logger.exception(
            "Chat classification failed: %s",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to process the customer message.",
        )


# ============================================================
# Stage 2: Generate Final Response
# ============================================================

@app.post(
    "/api/chat/respond",
    response_model=GenerateResponse,
)
async def generate_chat_response(
    request: GenerateResponseRequest,
):

    manager = get_session_manager()

    try:
        session_id, bot = manager.get_or_create(
            request.session_id
        )

        # ----------------------------------------------------
        # Python receives:
        #
        # 1. Original customer message
        # 2. Classification from LLM Call 1
        # 3. Trusted tool result from Node
        #
        # Python does NOT query MongoDB.
        # ----------------------------------------------------

        reply = bot.generate_response(
            user_message=request.message,
            classification=request.classification,
            tool_result=request.tool_result,
        )

        logger.info(
            "Final response generated | session=%s",
            session_id,
        )

        return GenerateResponse(
            type="response",
            session_id=session_id,
            reply=reply,
        )

    except HTTPException:
        raise

    except Exception as error:
        logger.exception(
            "Response generation failed: %s",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to generate the chatbot response.",
        )


# ============================================================
# Reset Conversation
# ============================================================

@app.post(
    "/api/chat/reset",
    response_model=ResetResponse,
)
async def reset_chat(request: ResetRequest):

    manager = get_session_manager()

    success = manager.reset(request.session_id)

    if not success:
        return ResetResponse(
            success=False,
            message="Session not found.",
        )

    return ResetResponse(
        success=True,
        message="Conversation reset successfully.",
    )


# ============================================================
# Development Entry Point
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "ml.api.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )

