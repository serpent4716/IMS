# app/core/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from sqlalchemy.orm import Session

bearer = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    user_id = decode_access_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


def require_manager(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "inventory_manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inventory Manager role required",
        )
    return current_user
