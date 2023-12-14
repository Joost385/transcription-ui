import io
import json
import os
from datetime import datetime
from typing import Annotated, Literal, Optional

import pandas as pd
from fastapi import APIRouter, Depends, Response, status
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session

import db.crud.recording as crud_recording
import db.crud.transcription as crud_transcription
import security.auth as auth
from db.models.user import User
from db.session import get_db
from worker import terminate_all_transcriptions
from schemas.transcription import (
    TranscriptionCreateSchema,
    TranscriptionProgressSchema,
    TranscriptionSchema,
    TranscriptSchema,
)

router = APIRouter(prefix="/transcriptions", tags=["transcriptions"])


@router.get(
    "/terminate_all",
    summary="Terminate transcriptions (admin)",
    description="Terminate all running and pending transcriptions.",
)
async def terminate_all(_: Annotated[User, Depends(auth.get_admin_user)]):
    terminate_all_transcriptions()
    return "All transcriptions terminated successfully."


@router.get(
    "",
    response_model=list[TranscriptionSchema],
    summary="Get transcriptions",
    description="Get all of the authenticated users transcriptions.",
)
async def get_transcriptions(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(auth.get_user)],
    recording_id: Optional[int] = None,
):
    return crud_transcription.find_user_transcriptions(db, user, recording_id)


@router.delete(
    "/{id}",
    summary="Delete transcription",
    description="Delete a transcription of the authenticated user by id.",
)
async def delete_transcription(
    id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(auth.get_user)],
):
    transcription = crud_transcription.find_user_transcription_by_id(db, id, user)
    if not transcription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription not found"
        )
    
    crud_transcription.delete_transcription(db, transcription)

    return"Deletion successful"


@router.post(
    "",
    response_model=TranscriptionSchema,
    summary="Create transcription",
    description="Create a transcription for the authenticated user.",
)
async def create_transcription(
    data: TranscriptionCreateSchema,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(auth.get_user)],
):
    recording = crud_recording.find_user_recording_by_id(db, data.recording_id, user)
    if not recording:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recording not found"
        )
    
    return crud_transcription.create_transcription(db, data, user)


@router.get(
    "/{id}/progress",
    response_model=TranscriptionProgressSchema,
    summary="Get transcription progress",
    description="Get the progress for a transcription of the authenticated user by id.",
)
async def get_progress(
    id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(auth.get_user)],
):
    transcription = crud_transcription.find_user_transcription_by_id(db, id, user)
    if not transcription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription not found"
        )
    
    took = None
    if transcription.started_at and transcription.finished_at:
        delta = transcription.finished_at - transcription.started_at
        took = int(delta.total_seconds())
    elif transcription.started_at:
        delta = datetime.utcnow() - transcription.started_at
        took = int(delta.total_seconds())
    
    return {
        "state": transcription.state,
        "took": took,
    }


@router.get(
    "/{id}/transcript",
    response_model=TranscriptSchema,
    summary="Get transcript",
    description="Get the transcript for a transcription of the authenticated user by id.",
)
async def get_transcript(
    id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(auth.get_user)],
):
    transcription = crud_transcription.find_user_transcription_by_id(db, id, user)
    if not transcription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription not found"
        )

    return transcription.transcript


@router.get(
    "/{id}/transcript/export",
    summary="Export transcript",
    description="Export the transcript for a transcription of the authenticated user by id.",
)
async def export_transcript(
    id: int,
    format: Literal["text", "json", "csv", "xlsx"],
    user: Annotated[User, Depends(auth.get_user_from_query)],
    db: Annotated[Session, Depends(get_db)],
):
    transcription = crud_transcription.find_user_transcription_by_id(db, id, user)
    if not transcription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcription not found"
        )
    
    transcript = transcription.transcript
    if not transcript:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcript not found"
        )
    
    timestamp = transcription.created_at.strftime("%Y-%m-%d_%H-%M-%S")
    basename = os.path.splitext(transcription.recording.name)[0]
    filename = f"{basename}_transcript_{timestamp}"

    if format == "text":
        return Response(
            content=transcript["text"],
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename={filename}.txt"}
        )
    
    if format == "json":
        return Response(
            content=json.dumps(transcript),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}.json"}
        )
    
    if not transcription.identify_speakers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{format} is only allowed transcriptions with speaker identification."
        )

    df = pd.DataFrame(transcript["speaker_segments"])
    df.rename(columns={
        "speaker": "Speaker",
        "start": "Start",
        "end": "End",
        "text": "Text"
    }, inplace=True)
    
    if format == "csv":
        output = io.StringIO()
        df.to_csv(output, index=False)
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}.csv"}
        )

    if format == "xlsx":
        output = io.BytesIO()
        df.to_excel(output, engine="xlsxwriter", index=False)
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}.xlsx"}
        )
