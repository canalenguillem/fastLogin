import subprocess
import hashlib
import os
import time

def calculate_hash(content):
    return hashlib.md5(content).hexdigest()[:10]

def save_and_convert_video(file_content, original_filename):
    timestamp = time.strftime("%Y%m%d%H%M%S")
    file_hash = calculate_hash(file_content)
    temp_filename = f"temp_{timestamp}_{file_hash}.webm"
    temp_location = f"uploads/videos/{temp_filename}"

    with open(temp_location, "wb") as f:
        f.write(file_content)

    # Define the output filename and location
    new_filename = f"{timestamp}_{file_hash}.mp4"
    output_location = f"uploads/videos/{new_filename}"

    # Convert the video using ffmpeg
    try:
        subprocess.run([
            "ffmpeg", "-i", temp_location, "-c:v", "libx264", "-crf", "23",
            "-c:a", "aac", "-b:a", "192k", output_location
        ], check=True)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Error converting video: {e}")

    # Remove the temporary file
    os.remove(temp_location)

    return new_filename, output_location
