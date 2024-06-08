import os

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi import File, UploadFile
import shutil
from typing import List


from sqlalchemy.orm import Session
import models, database, auth
from schemas import User, UserCreate, Token,Audio,Video
from auth import get_current_user
from fastapi.staticfiles import StaticFiles

from libs.audio_utils import save_and_convert_audio,calculate_hash
from libs.video_utils import save_and_convert_video, calculate_hash




app = FastAPI()

# Verificar y crear la carpeta videos si no existe
if not os.path.exists('uploads/videos'):
    os.makedirs('uploads/videos')
    
    
# Montar el directorio de uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# Montar el directorio de videos
app.mount("/uploads/videos", StaticFiles(directory="uploads/videos"), name="videos")


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

@app.get("/user-audios/", response_model=List[Audio])
async def get_user_audios(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Audio).filter(models.Audio.owner_id == current_user.id).all()

@app.get("/user-videos/")
def get_user_videos(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    print("entro en la funcion de get_user_videos")
    videos = db.query(models.Video).filter(models.Video.owner_id == current_user.id).all()
    return videos

@app.delete("/delete-audio/{audio_id}", response_model=Audio)
async def delete_audio(audio_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    audio = db.query(models.Audio).filter(models.Audio.id == audio_id, models.Audio.owner_id == current_user.id).first()
    if not audio:
        raise HTTPException(status_code=404, detail="Audio not found")

    # Delete the file from the file system
    if os.path.exists(audio.file_location):
        os.remove(audio.file_location)

    # Delete the record from the database
    db.delete(audio)
    db.commit()
    return audio


@app.post("/upload-video/", response_model=Video)
async def upload_video(file: UploadFile = File(...), db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    file_content = await file.read()

    # Calcular hash
    file_hash = calculate_hash(file_content)
    
    # Verificar si el archivo ya existe por hash
    existing_video = db.query(models.Video).filter(models.Video.filename.like(f"%{file_hash}%")).first()
    if existing_video:
        raise HTTPException(status_code=400, detail="File already uploaded")

    # Guardar y convertir el video
    new_filename, file_location = save_and_convert_video(file_content, file.filename)

    # Guardar en la base de datos
    video_db = models.Video(filename=new_filename, file_location=file_location, owner_id=current_user.id)
    db.add(video_db)
    db.commit()
    db.refresh(video_db)
    return video_db



# Ruta para eliminar un video
@app.delete("/delete-video/{video_id}")
async def delete_video(video_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    video = db.query(models.Video).filter(models.Video.id == video_id, models.Video.owner_id == current_user.id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    # Eliminar el archivo de video del sistema de archivos
    try:
        os.remove(video.file_location)
    except FileNotFoundError:
        pass

    # Eliminar el registro de la base de datos
    db.delete(video)
    db.commit()

    return {"message": "Video deleted successfully"}