from pydantic import BaseModel

class RoleBase(BaseModel):
    name: str
    description: str

class RoleCreate(RoleBase):
    pass

class Role(RoleBase):
    id: int

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role_id: int  # Añade el campo role_id

class User(BaseModel):
    id: int
    username: str
    email: str
    role: Role  # Añade la relación con Role

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
