from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, status
from fastapi.exceptions import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_limiter.depends import RateLimiter
from pydantic import EmailStr
from sqlalchemy.orm import Session

import db.crud.password_reset as crud_password_reset
import db.crud.user as crud_user
import security.auth as auth
from db.models.user import User
from db.session import get_db
from notification.send import send_password_reset
from schemas.security import PasswordResetSchema, TokenSchema
from security.token import create_user_token

router = APIRouter(prefix="/security", tags=["security"])


@router.post(
    "/token",
    response_model=TokenSchema,
    dependencies=[Depends(RateLimiter(times=10, minutes=5))],
    summary="Get a token",
    description="Get an authentication token.",
)
async def token(
    db: Annotated[Session, Depends(get_db)],
    data: OAuth2PasswordRequestForm = Depends(),
):
    user = auth.authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    return {
        "access_token": create_user_token(user),
        "token_type": "bearer",
    }


@router.get(
    "/temp_token",
    response_model=TokenSchema,
    summary="Get temporary token",
    description="Get a temporary token with a very short expiry time.",
)
async def temp_token(user: Annotated[User, Depends(auth.get_user)]):
    ttl = timedelta(seconds=30)

    return {
        "access_token": create_user_token(user, ttl),
        "token_type": "temp",
    }


@router.get(
    "/password_reset/{email}",
    dependencies=[Depends(RateLimiter(times=10, minutes=5))],
    summary="Request password reset",
    description="Request a password reset for an email.",
)
async def request_password_reset(
    email: EmailStr,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
):
    user = crud_user.find_user_by_email(db, email)
    if user and user.active:
        too_many_requests = crud_password_reset.user_has_active_password_reset(db, user)
        if not too_many_requests:
            password_reset = crud_password_reset.create_password_reset(db, user)
            background_tasks.add_task(send_password_reset, password_reset)

    return f"If ${email} is an active registered account, an email with instructions will be sent."


@router.post(
    "/password_reset/{token}",
    dependencies=[Depends(RateLimiter(times=10, minutes=5))],
    summary="Execute password reset",
    description="Executes a password reset for a given token.",
)
async def execute_password_reset(
    token: str,
    data: PasswordResetSchema,
    db: Annotated[Session, Depends(get_db)],
):
    password_reset = crud_password_reset.find_password_reset_by_token(db, token)
    if not password_reset or password_reset.is_expired() or not password_reset.user.active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password reset not authorized",
        )
    
    crud_password_reset.process_password_reset(db, password_reset, data)
