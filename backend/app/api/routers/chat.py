from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.api.dependencies import get_current_user
from app.models import User
import httpx
from app.core.config import settings

router = APIRouter()


# Заглушка, имитирующая потоковый ответ от polza.ai
async def get_polza_stream(message: str):
    # TODO: Заменить на реальный API-вызов к polza.ai
    # (вероятно, используя httpx.AsyncClient().stream())

    response_chunks = [
        "Это ", "потоковый ", "ответ, ", "имитирующий ", "работу ",
        f"polza.ai ", f"в ответ ", f"на '{message}'."
    ]
    for chunk in response_chunks:
        import asyncio
        await asyncio.sleep(0.1)  # Имитация задержки сети
        yield chunk


@router.websocket("/stream")
async def chat_stream(
        ws: WebSocket,
        # TODO: Здесь нужна аутентификация по токену в query-параметре,
        # т.к. WebSocket не отправляет Bearer заголовки.
        # Для простоты пока опустим, но это НЕБЕЗОПАСНО.
        # current_user: User = Depends(get_current_user_ws)
):
    await ws.accept()
    try:
        await ws.send_text("🤖 Connected. Type a message.")
        while True:
            text = await ws.receive_text()

            # TODO: Сохранить text в БД (Message с role='user')

            await ws.send_text(f"User: {text}")  # Эхо для пользователя

            # Потоковая передача ответа AI
            ai_response = ""
            async for chunk in get_polza_stream(text):
                ai_response += chunk
                await ws.send_text(f"AI: {ai_response}")  # Отправляем обновленный полный ответ

            # TODO: Сохранить ai_response в БД (Message с role='ai')

    except WebSocketDisconnect:
        print("Client disconnected")
        return