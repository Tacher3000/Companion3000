from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import User
from app.schemas import UserCreate
from app.core.security import get_password_hash
import uuid
from typing import Optional

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Получает пользователя по email."""
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


async def create_user(db: AsyncSession, user: UserCreate) -> User:
    """Создает нового пользователя."""
    hashed_password = get_password_hash(user.password)

    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        username=user.username,
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user