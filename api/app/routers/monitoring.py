from typing import Annotated

import GPUtil
import psutil
from decouple import config
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import db.crud.transcription as crud_transcription
import security.auth as auth
from db.models.user import User
from db.session import get_db
from schemas.monitoring import SystemStats, TranscriptionStats

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

CELERY_CONCURRENCY = config("CELERY_CONCURRENCY", cast=int)


@router.get(
    "/system",
    response_model=SystemStats,
    summary="Get system usage (admin)",
    description="Get system usage statistics in percent for cpu, gpu, vram, memory.",
)
async def get_system_stats(_: Annotated[User, Depends(auth.get_admin_user)]):
    cpu = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    gpu, vram = get_gpu_usage()

    return {
        "cpu": cpu,
        "gpu": gpu,
        "vram": vram,
        "memory": {
            "total": memory.total,
            "available": memory.available,
            "used": memory.used,
            "used_percent": memory.percent,
        },
    }


@router.get(
    "/transcriptions",
    response_model=TranscriptionStats,
    summary="Get transcription statistics (admin)",
    description="Get the number of currently running and pending transcriptions.",
)
async def get_transcription_stats(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(auth.get_admin_user)]
):
    return {
        "max_transcriptions": CELERY_CONCURRENCY,
        "n_pending": crud_transcription.get_pending_transcriptions_count(db),
        "n_running": crud_transcription.get_running_transcriptions_count(db),
    }


def get_gpu_usage():
    try:
        gpus = GPUtil.getGPUs()
        if not gpus:
            return None, None

        total_load = 0
        total_memory_usage = 0
        for gpu in gpus:
            total_load += gpu.load * 100
            total_memory_usage += (gpu.memoryUsed / gpu.memoryTotal) * 100

        return (
            total_load / len(gpus),
            total_memory_usage / len(gpus)
        )
    except Exception as e:
        print(f"Error: {e}")
        return None, None