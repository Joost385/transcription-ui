from datetime import datetime

from decouple import config
from pydantic import BaseModel

FILES_MAX_SIZE_BYTE = config("FILES_MAX_SIZE_BYTE", cast=int)
FILES_MAX_SIZE_MB = int(FILES_MAX_SIZE_BYTE / 2**20)

RECORDING_MIME_TYPES = {
    # ======= WAV =======
    "audio/wav": "wav",
    "audio/vnd.wave": "wav",
    "audio/wave": "wav",
    "audio/x-wav": "wav",
    # ======= MP3 =======
    "audio/mp3": "mp3",
    "audio/mpeg": "mp3",
    "audio/x-mpeg": "mp3",
    "audio/mpg": "mp3",
    "audio/x-mp3": "mp3",
    "audio/mpeg3": "mp3",
    "audio/x-mpeg3": "mp3",
    # ======= OGG =======
    "audio/ogg": "ogg",
    "audio/x-ogg": "ogg",
    "audio/vorbis": "ogg",
    "application/ogg": "ogg",
}


class RecordingSchema(BaseModel):
    id: int
    created_at: datetime
    name: str
    size: int
    duration: int

    class Config:
        from_attributes = True


def get_recording_validation_error(mime_type: str, file_size: int) -> str | None:
    if not mime_type in RECORDING_MIME_TYPES:
        allowed_mime_types = ", ".join(set(RECORDING_MIME_TYPES.values()))
        return f"Allowed are the following formats: {allowed_mime_types}"
    if file_size > FILES_MAX_SIZE_BYTE:
        return f"The recording is too large, allowed are at most {FILES_MAX_SIZE_MB} MB"