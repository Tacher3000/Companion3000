from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import JSONResponse
import httpx
from app.core.config import settings
from app.api.dependencies import get_current_user
from app.models import User
from app.schemas import Txt2ImgRequest

router = APIRouter()


@router.post("/generate")
async def sdxl_generate(
        payload: Txt2ImgRequest,
        current_user: User = Depends(get_current_user)  # Защищаем эндпоинт
):
    """
    Отправляет prompt в Automatic1111 (txt2img API).
    """
    try:
        # Используем URL из настроек
        api_url = f"{settings.COMFYUI_URL}/sdapi/v1/txt2img"

        async with httpx.AsyncClient(timeout=300) as client:
            r = await client.post(api_url, json=payload.model_dump())
            r.raise_for_status()
            data = r.json()

        # A1111 возвращает base64-изображения в списке 'images'
        return JSONResponse(content={"images": data.get("images", [])})

    except httpx.RequestError as e:
        return JSONResponse(status_code=502, content={"error": f"Error connecting to SD API: {e}"})
    except httpx.HTTPStatusError as e:
        return JSONResponse(status_code=e.response.status_code,
                            content={"error": f"Error from SD API: {e.response.text}"})