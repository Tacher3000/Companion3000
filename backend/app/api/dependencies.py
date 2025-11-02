from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError
from app.db.session import get_db
from app.core import security
from app.schemas import TokenPayload
from app.crud import user_crud
from app.models import User
from typing import Optional

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


async def get_current_user(
        db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = security.decode_token(token)
    if payload is None:
        raise credentials_exception

    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception

    user = await user_crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_user_no_exception(
        db: AsyncSession = Depends(get_db),
        token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[User]:
    """
    Пытается получить текущего пользователя по токену в заголовке Authorization.
    В случае отсутствия или недействительности токена возвращает None, а не HTTPException.
    """
    try:
        if token is None:
            return None

        payload = security.decode_token(token)

        email: str = payload.get("sub")
        if email is None:
            return None

        user = await user_crud.get_user_by_email(db, email=email)

        return user

    except JWTError:
        # Недействительный JWT токен (истек, неверная подпись и т.д.)
        return None
    except Exception:
        # Любая другая непредвиденная ошибка
        return None