import asyncio
import uuid

import aiofiles
from fastapi import UploadFile
from sqlalchemy.orm import Session

from db.models.recording import Recording
from db.models.user import User
from schemas.recording import RECORDING_MIME_TYPES
from utils import audio_duration_seconds


def find_user_recording_by_id(db: Session, id: int, user: User) -> Recording | None:
    return db.query(Recording) \
        .filter(Recording.id == id) \
        .filter(Recording.user == user) \
        .one_or_none()


def find_user_recordings(db: Session, user: User) -> list[Recording]:
    return db.query(Recording) \
        .filter(Recording.user == user) \
        .order_by(Recording.id.desc()) \
        .all()


def delete_recording(db: Session, recording: Recording) -> None:
    db.delete(recording)
    db.commit()


async def create_recording(db: Session, file: UploadFile, user: User) -> Recording:
    format = RECORDING_MIME_TYPES[file.content_type]
    filename = f"user_{user.id}_recording_{uuid.uuid4()}.{format}"
    recording = Recording(
        filename=filename,
        name=file.filename,
        format=format,
        size=file.size,
        user=user,
    )

    recording_path = recording.get_path()
    async with aiofiles.open(recording_path, "wb") as output_file:
        content = await file.read()
        await output_file.write(content)
    loop = asyncio.get_event_loop()
    recording.duration = await loop.run_in_executor(None, audio_duration_seconds, recording_path)

    db.add(recording)
    db.commit()
    db.refresh(recording)
    return recording
