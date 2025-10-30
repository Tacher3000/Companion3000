from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import httpx
import json

# --- ИЗМЕНЕНИЕ ЗДЕСЬ: Используем host.docker.internal для обращения к A1111 на хосте ---
# SD_API_URL теперь указывает на хостовую машину, где запущен A1111 на порту 7860
SD_API_URL = os.getenv("SD_API_URL", "http://host.docker.internal:7860")
# ------------------------------------------------------------------------------------

app = FastAPI(title="AI Companion MVP (Local GPU)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"status": "ok"}


# ---- Simple WebSocket echo chat (placeholder for LLM) ----
@app.websocket("/api/chat/stream")
async def chat_stream(ws: WebSocket):
    await ws.accept()
    try:
        await ws.send_text("🤖 Connected. Type a message, I'll echo it.")
        while True:
            text = await ws.receive_text()
            # TODO: replace with polza.ai streaming
            await ws.send_text(f"AI: {text}")
    except WebSocketDisconnect:
        return


@app.post("/api/sdxl/generate")
async def sdxl_generate(payload: dict):
    """
    Отправляет prompt в Automatic1111 (txt2img API).
    Минимально требуемое поле: {"prompt": "описание картинки"}.
    Возвращает base64-encoded изображение.
    """
    # Задаем минимальный payload для A1111 API, если пользователь прислал только prompt
    default_payload = {
        "prompt": payload.get("prompt",
                              "a stunning high-resolution image of a cybernetic cat in a spacesuit, digital art"),
        "negative_prompt": payload.get("negative_prompt", "blurry, low quality, worst quality, deformed, messy"),
        "steps": payload.get("steps", 20),
        "sampler_name": payload.get("sampler_name", "Euler a"),
        "width": payload.get("width", 1024),
        "height": payload.get("height", 1024),
        "cfg_scale": payload.get("cfg_scale", 7),
        "n_iter": 1,
        "batch_size": 1,
    }

    # Объединяем полученный payload с дефолтными значениями
    # Предпочтение отдается пользовательским значениям
    api_payload = {**default_payload, **payload}

    try:
        async with httpx.AsyncClient(timeout=300) as client:
            # Используем исправленный SD_API_URL и корректный эндпоинт A1111 API
            response = await client.post(
                f"{SD_API_URL}/sdapi/v1/txt2img",
                json=api_payload
            )
            response.raise_for_status()  # Вызывает исключение при 4xx/5xx ошибках

            result = response.json()
            # A1111 API возвращает список изображений в формате base64 под ключом 'images'
            if result.get("images"):
                # Возвращаем только первое изображение в списке
                return JSONResponse({"image_base64": result["images"][0]})
            else:
                return JSONResponse({"error": "No image data returned from SD API."}, status_code=500)

    except httpx.ConnectError:
        # Теперь ошибка будет указывать, что не удалось подключиться к хосту.
        return JSONResponse({
                                "error": f"Could not connect to SD API at {SD_API_URL}. Is Automatic1111 running on your host machine on port 7860 with the --api flag?"},
                            status_code=503)
    except httpx.HTTPStatusError as e:
        return JSONResponse({"error": f"SD API returned an error: {e.response.text}"},
                            status_code=e.response.status_code)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return JSONResponse({"error": f"An unexpected error occurred: {e}"}, status_code=500)
