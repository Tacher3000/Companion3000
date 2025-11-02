from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import httpx
import json

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from app.db.session import get_db  # Если get_db использует engine, адаптируй
from app.models import Base  # Импорт Base для metadata
from app.core.config import settings  # Если DATABASE_URL в config

from app.api.routers import auth, users, chat, image_gen

# --- ИЗМЕНЕНИЕ ЗДЕСЬ: Используем host.docker.internal для обращения к A1111 на хосте ---
SD_API_URL = os.getenv("SD_API_URL", "http://host.docker.internal:7860")
# ------------------------------------------------------------------------------------

# Async engine для создания таблиц (используй твою DB URL, например из settings)
engine = create_async_engine(settings.DATABASE_URL, echo=True)  # Добавь echo для логов, если нужно

app = FastAPI(title="AI Companion MVP (Local GPU)")

app.include_router(auth.router, prefix="/api/v1/auth")
app.include_router(users.router, prefix="/api/v1/users")
app.include_router(chat.router, prefix="/api/v1/chat")
app.include_router(image_gen.router, prefix="/api/v1/image")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Хук для создания таблиц при старте
@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)  # Создаёт все таблицы из models

@app.get("/")
async def root():
    return {"status": "ok"}

# ---- Удали заглушки, если не нужны ----
# @app.websocket("/api/chat/stream") ...
# @app.post("/api/sdxl/generate") ...