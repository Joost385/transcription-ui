import asyncio
import os
from tempfile import NamedTemporaryFile
from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile, status
from fastapi.exceptions import HTTPException
from fastapi.responses import FileResponse
from pydantic import confloat
from sqlalchemy.orm import Session
from starlette.background import BackgroundTask

import db.crud.recording as crud_recording
import security.auth as auth
from db.models.user import User
from db.session import get_db
from schemas.recording import RecordingSchema, get_recording_validation_error
from utils import audio_convert

router = APIRouter(prefix="/recordings", tags=["recordings"])


@router.get(
    "",
    response_model=list[RecordingSchema],
    summary="Get recordings",
    description="Get a list of the authenticated users recordings.",
)
async def get_recordings(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(auth.get_user)],
):
    return crud_recording.find_user_recordings(db, user)


@router.get(
    "/{id:int}",
    response_model=RecordingSchema,
    summary="Get recording",
    description="Get a recording of the authenticated user by id.",
)
async def get_recording(
    id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(auth.get_user)],
):
    recording = crud_recording.find_user_recording_by_id(db, id, user)
    if not recording:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found",
        )

    return recording


@router.delete(
    "/{id}",
    summary="Delete recording",
    description="Delete a recording of the authenticated user by id.",
)
async def delete_recording(
    id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(auth.get_user)],
):
    recording = crud_recording.find_user_recording_by_id(db, id, user)
    if not recording:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found",
        )
    
    crud_recording.delete_recording(db, recording)

    return "Deletion successful."


@router.post(
    "/upload",
    response_model=RecordingSchema,
    summary="Upload recording",
    description="Uploads a recording for the authenticated user.",
)
async def upload_recording(
    file: UploadFile,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(auth.get_user)],
):
    validation_error = get_recording_validation_error(file.content_type, file.size)
    if validation_error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=validation_error,
        )
    
    return await crud_recording.create_recording(db, file, user)


@router.get(
    "/validate",
    summary="Validate file",
    description="Validates a file based on mime type and file size.",
)
async def validate_recording(
    mime_type: str,
    file_size: int,
    _: Annotated[User, Depends(auth.get_user)],
):
    validation_error = get_recording_validation_error(mime_type, file_size)
    if validation_error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=validation_error
        )

    return "Validation successful."


@router.get(
    "/{id}/download",
    summary="Download a recording",
    description="Downloads a recording/segment of the authenticated user by id.",
)
async def download_recording(
    id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(auth.get_user_from_query)],
    start: confloat(ge=0) = 0,
    end: confloat(gt=0) = None,
):
    if end and start >= end:
        raise HTTPException(
            status_code=422,
            detail="End time must be greater than start time."
        )

    recording = crud_recording.find_user_recording_by_id(db, id, user)
    if not recording:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found.",
        )
    
    
    if start == 0 and end is None:
        return FileResponse(
            path=recording.get_path(),
            filename=recording.name,
            media_type=recording.get_mime_type(),
        )
    else:
        temp_file = NamedTemporaryFile(delete=False, suffix=f".{recording.format}")
        temp_file.close()
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            audio_convert,
            recording.get_path(),
            temp_file.name,
            recording.format,
            start,
            end,
        )
        return FileResponse(
            path=temp_file.name,
            media_type=recording.get_mime_type(),
            background=BackgroundTask(lambda: os.unlink(temp_file.name))
        )
