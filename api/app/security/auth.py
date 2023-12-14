from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyQuery, OAuth2PasswordBearer
from sqlalchemy.orm import Session

from db.crud.user import find_user_by_email
from db.models.user import User
from db.session import get_db
from security.hashing import verify_password
from security.token import get_token_user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="security/token")
query_scheme = APIKeyQuery(name="token")


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = find_user_by_email(db, email)
    if not user:
        return None
    if not user.active:
        return None
    if not user.password_hash:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def get_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    user = get_token_user(token, db)
    if not user or not user.active or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized request"
        )
    return user


def get_admin_user(user: Annotated[User, Depends(get_user)]) -> User:
    if not user.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can access this resource"
        )
    return user


def get_user_from_query(
    token: Annotated[str, Depends(query_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    user = get_token_user(token, db)
    if not user or not user.active or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized request"
        )
    return user
