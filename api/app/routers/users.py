from typing import Annotated

from decouple import config
from fastapi import APIRouter, BackgroundTasks, Depends, status
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session

import db.crud.password_reset as crud_password_reset
import db.crud.user as crud_user
import security.auth as auth
from db.models.user import User
from db.session import get_db
from notification.send import send_password_reset
from schemas.user import UserCreateSchema, UserEditSchema, UserSchema

CONTACT_EMAIL = config("CONTACT_EMAIL")

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/me",
    response_model=UserSchema,
    summary="Get current user",
    description="Get the currently authenticated user.",
)
async def get_me(user: Annotated[User, Depends(auth.get_user)]):
    return user

@router.delete(
    "/me",
    summary="Delete current user",
    description="Delete the currently authenticated user including all its data.",
)
async def delete_me(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(auth.get_user)],
):
    db.delete(user)
    db.commit()
    return "User deleted successfully"


@router.get(
    "/contact_email",
    summary="Get admin contact email",
    description="Get the contact email of the system administrator.",
)
async def get_contact_email(_: Annotated[User, Depends(auth.get_user)]):
    return CONTACT_EMAIL


@router.get(
    "",
    response_model=list[UserSchema],
    summary="Get users (admin)",
    description="Get a list of all registered users.",
)
async def get_users(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(auth.get_admin_user)],
):
    return crud_user.find_all_users(db)


@router.post(
    "",
    response_model=UserSchema,
    summary="Create user (admin)",
    description="Get a list of all registered users.",
)
async def create_user(
    data: UserCreateSchema,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(auth.get_admin_user)],
):
    user = crud_user.create_user(db, data)
    password_reset = crud_password_reset.create_password_reset(db, user)
    background_tasks.add_task(send_password_reset, password_reset)

    return user


@router.patch(
    "/{id}",
    response_model=UserSchema,
    summary="Update user (admin)",
    description="Update a user by id.",
)
async def edit_user(
    id: int,
    data: UserEditSchema,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(auth.get_admin_user)],
):
    user = crud_user.find_user_by_id(db, id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return crud_user.edit_user(db, user, data)


@router.delete(
    "/{id}",
    summary="Delete user (admin)",
    description="Delete a user by id including all its data.",
)
async def delete_user(
    id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(auth.get_admin_user)],
):
    user = crud_user.find_user_by_id(db, id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    crud_user.delete_user(db, user)
    
    return "Deletion successful."
