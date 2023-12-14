from pydantic import BaseModel


class MemoryStats(BaseModel):
    total: int
    available: int
    used: int
    used_percent: float


class SystemStats(BaseModel):
    cpu: float
    gpu: float | None
    vram: float | None
    memory: MemoryStats


class TranscriptionStats(BaseModel):
    max_transcriptions: int
    n_pending: int
    n_running: int
