from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.models import User
from app.schemas import UserCreate, Token, TokenPayload
from app.core import security
from app.core.config import settings
from typing import Optional

router = APIRouter(prefix="/auth", tags=["auth"])


# Функция для поиска пользователя по email
async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalars().first()


# --- Регистрация ---
@router.post("/register", response_model=UserCreate, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Проверка, существует ли пользователь
    if await get_user_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким email уже существует",
        )

    # Хеширование пароля
    hashed_password = security.get_password_hash(user_in.password)

    # Создание пользователя
    db_user = User(email=user_in.email, hashed_password=hashed_password)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    # Возвращаем данные пользователя, но без хешированного пароля (используем UserCreate)
    # Здесь можно вернуть UserPublic, но для простоты используем UserCreate
    return user_in


# --- Вход (Получение токенов) ---
@router.post("/token", response_model=Token)
async def login_for_access_token(
        response: Response,
        db: AsyncSession = Depends(get_db),
        form_data: OAuth2PasswordRequestForm = Depends()  # Использует username (email) и password
):
    user = await get_user_by_email(db, form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Создание токенов
    access_token = security.create_access_token(data={"sub": user.email})
    refresh_token = security.create_refresh_token(data={"sub": user.email})

    # Установка Refresh Token в HTTP-Only Cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.HTTPS_ENABLED,  # true в продакшене
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # срок действия в секундах
        samesite="Lax",
        path="/api/auth",  # Устанавливаем специфичный путь для куки
    )

    return Token(access_token=access_token,
                 refresh_token=refresh_token)  # Refresh token возвращаем и в теле ответа для фронтенда


# --- Обновление токена ---
@router.post("/refresh", response_model=Token)
async def refresh_access_token(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    # Получаем refresh token из cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")

    # Декодируем и валидируем refresh token
    payload = security.decode_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    user_email = payload.sub
    user = await get_user_by_email(db, user_email)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Генерируем новый Access Token
    new_access_token = security.create_access_token(data={"sub": user.email})

    # Опционально: генерируем новый Refresh Token и устанавливаем его в cookie
    # Для повышения безопасности можно один раз использовать refresh токен (rotation)
    new_refresh_token = security.create_refresh_token(data={"sub": user.email})

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=settings.HTTPS_ENABLED,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="Lax",
        path="/api/auth",
    )

    return Token(access_token=new_access_token, refresh_token=new_refresh_token)