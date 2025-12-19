from pydantic import BaseModel
from app.schemas.user import UserRead


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserRead


class TokenPayload(BaseModel):
    sub: int | None = None
