import os

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi import File, UploadFile
import shutil


from sqlalchemy.orm import Session
import models, database, auth
from schemas import User, UserCreate, Token,Audio
from auth import get_current_user

from libs.audio_utils import save_and_convert_audio,calculate_hash



app = FastAPI()
# Configurar CORS
origins = [
    "http://localhost",  # Ajusta esto según sea necesario
    "http://localhost:8000",
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=database.engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register_user/", response_model=User)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user_by_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="Username already registered")

    db_user_by_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        username=user.username, 
        email=user.email, 
        hashed_password=auth.get_password_hash(user.password),
        role_id=user.role_id  # Asignar rol de usuario por defecto
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me/", response_model=User)
def read_users_me(current_user: User = Depends(auth.get_current_user)):
    return current_user

@app.get("/roles/")
def get_roles(db: Session = Depends(database.get_db)):
    roles = db.query(models.Role).all()
    return roles


@app.post("/upload-audio/", response_model=Audio)
async def upload_audio(file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    print("leer contenido")
    file_content = await file.read()

    print("calcular hash")
    file_hash = calculate_hash(file_content)
    
    # Verificar si el archivo ya existe por hash
    existing_audio = db.query(models.Audio).filter(models.Audio.filename.like(f"{file_hash}%")).first()
    if existing_audio:
        raise HTTPException(status_code=400, detail="File already uploaded")

    print("funcion modulo utilidades")
    new_filename, file_location = save_and_convert_audio(file_content, file.filename)

    print("guardar en bbdd")
    audio_db = models.Audio(filename=new_filename, file_location=file_location, owner_id=current_user.id)
    db.add(audio_db)
    db.commit()
    db.refresh(audio_db)
    return audio_db