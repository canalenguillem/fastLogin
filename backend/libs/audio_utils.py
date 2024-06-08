# libs/audio_utils.py
import os
import hashlib
from datetime import datetime
from pydub import AudioSegment

def calculate_hash(file_content, length=10):
    hash_object = hashlib.sha256(file_content)
    return hash_object.hexdigest()[:length]

def save_and_convert_audio(file_content, original_filename):
    file_hash = calculate_hash(file_content)
    current_time = datetime.now().strftime("%Y%m%d%H%M%S")
    new_filename = f"{current_time}_{file_hash}.mp3"

    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    file_location = os.path.join(uploads_dir, new_filename)

    # Guardar el archivo temporalmente
    temp_file_location = os.path.join(uploads_dir, original_filename)
    with open(temp_file_location, "wb") as temp_file:
        temp_file.write(file_content)

    # Convertir a mp3
    audio = AudioSegment.from_file(temp_file_location)
    audio.export(file_location, format="mp3")
    
    # Eliminar el archivo temporal
    os.remove(temp_file_location)

    return new_filename, file_location
