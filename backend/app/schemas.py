from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional, List
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserPublic(UserBase):
    id: UUID4
    created_at: datetime
    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str # user email

# --- Character Schemas ---
class CharacterBase(BaseModel):
    name: str
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    system_prompt: Optional[str] = None

class CharacterCreate(CharacterBase):
    pass

class CharacterPublic(CharacterBase):
    id: UUID4
    owner_id: UUID4
    class Config:
        from_attributes = True

# --- Chat Schemas ---
class MessageBase(BaseModel):
    role: str
    content: str

class MessagePublic(MessageBase):
    id: UUID4
    created_at: datetime
    class Config:
        from_attributes = True

class ChatSessionBase(BaseModel):
    title: str

class ChatSessionPublic(ChatSessionBase):
    id: UUID4
    user_id: UUID4
    character_id: UUID4
    messages: List[MessagePublic] = []
    class Config:
        from_attributes = True

# --- Image Gen Schemas ---
class Txt2ImgRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = "ugly, bad art, deformed"
    steps: Optional[int] = 20
    width: Optional[int] = 1024
    height: Optional[int] = 1024