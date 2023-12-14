from datetime import datetime, timedelta

from decouple import config
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from db.crud.user import find_user_by_id
from db.models.user import User

JWT_ALGORITHM = "HS256"
JWT_SECRET_KEY = config("JWT_SECRET_KEY")
JWT_TOKEN_EXPIRY_HOURS = config("JWT_TOKEN_EXPIRY_HOURS", cast=int)


def create_user_token(user: User, ttl: timedelta = timedelta(hours=JWT_TOKEN_EXPIRY_HOURS)) -> str:
    return jwt.encode(
        {
            "sub": str(user.id),
            "exp": datetime.utcnow() + ttl
        },
        key=JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


def get_token_user(token: str, db: Session) -> User | None:
    try:
        claims = jwt.decode(
            token,
            key=JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )
    except JWTError:
        return None

    return find_user_by_id(db, claims.get("sub"))
