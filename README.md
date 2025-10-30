# AI Companion MVP (Local GPU, Windows + Docker)

Этот пакет разворачивает минимальный прототип:
- **Frontend**: Next.js 15 (порт 3000)
- **Backend**: FastAPI (порт 8000)
- **Redis**: кэш (порт 6379)

## Требования
- Windows 10/11 + **WSL2** + **Docker Desktop** с поддержкой GPU (Enable WSL integration)
- NVIDIA драйвер (>= 535)
- Порты 3000, 8000, 8188, 6379 свободны

## Установка и запуск
1. Распаковать архив в удобную папку.

2. (Опционально) Положить checkpoint в:
   ```
   ./models/Stable-diffusion/
   ```
   Пример: `sd_xl_base_1.0.safetensors`
3. Запуск:
   ```powershell
   docker compose up --build
   ```
4. Открыть:
   - Frontend: http://localhost:3000
   - Backend (Swagger): http://localhost:8000/docs
   - ComfyUI: http://localhost:8188
