from contextlib import asynccontextmanager

import redis.asyncio as redis
from decouple import config
from fastapi import FastAPI
from fastapi_limiter import FastAPILimiter

import db.events
from cli import cli
from routers import monitoring, recordings, security, transcriptions, users
from worker import sync_transcriptions

REDIS_URL = config("REDIS_URL")


@asynccontextmanager
async def lifespan(app: FastAPI):
    redis_connection = redis.from_url(
        REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )
    await FastAPILimiter.init(redis_connection)
    await sync_transcriptions()
    yield
    await redis_connection.close()
    await sync_transcriptions()


app = FastAPI(
    root_path="/api",
    version="1.0.0",
    lifespan=lifespan,
)
app.include_router(recordings.router)
app.include_router(transcriptions.router)
app.include_router(users.router)
app.include_router(security.router)
app.include_router(monitoring.router)


if __name__ == "__main__":
    cli()
