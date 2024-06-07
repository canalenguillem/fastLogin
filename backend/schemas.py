# schemas.py
from pydantic import BaseModel

# Esquemas
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class User(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True  # Actualizado para Pydantic V2

class Token(BaseModel):
    access_token: str
    token_type: str
