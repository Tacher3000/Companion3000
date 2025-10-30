from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models import User
from app.schemas import UserPublic, CharacterCreate, CharacterPublic
from app.api.dependencies import get_current_user
from sqlalchemy.future import select
from app.models import Character
import uuid

router = APIRouter()

@router.get("/me", response_model=UserPublic)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/me/characters", response_model=CharacterPublic, status_code=201)
async def create_character(
    character_in: CharacterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_character = Character(**character_in.model_dump(), owner_id=current_user.id)
    db.add(db_character)
    await db.commit()
    await db.refresh(db_character)
    return db_character

@router.get("/me/characters", response_model=list[CharacterPublic])
async def get_my_characters(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Character).where(Character.owner_id == current_user.id)
    )
    return result.scalars().all()