# video_utils.py
# video_utils.py
import os
import subprocess
from datetime import datetime
import hashlib

def calculate_hash(file_content):
    return hashlib.md5(file_content).hexdigest()[:10]

def save_and_convert_video(file_content, filename):
    # Crear un nombre de archivo único utilizando un hash
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    hash_obj = hashlib.sha256(file_content)
    short_hash = hash_obj.hexdigest()[:10]
    new_filename = f"{timestamp}_{short_hash}.mp4"
    temp_location = f"uploads/videos/temp_{timestamp}_{short_hash}.webm"
    
    # Guardar el archivo temporalmente
    with open(temp_location, "wb") as temp_file:
        temp_file.write(file_content)
    
    try:
        # Convertir el archivo a mp4 utilizando ffmpeg
        output_location = f"uploads/videos/{new_filename}"
        command = [
            "ffmpeg", "-i", temp_location,
            "-c:v", "libx264", "-c:a", "aac",
            output_location
        ]
        subprocess.run(command, check=True)
    except Exception as e:
        print(f"Error converting video: {e}")
        os.remove(temp_location)
        raise e

    # Eliminar el archivo temporal
    os.remove(temp_location)

    return new_filename, output_location