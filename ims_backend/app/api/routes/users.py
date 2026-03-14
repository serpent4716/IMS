# app/api/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.security import hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UserOut
from app.schemas.user import ChangePasswordIn, UpdateProfileIn

router = APIRouter(prefix="/users", tags=["Users"])


@router.patch("/me", response_model=UserOut)
def update_profile(
    data: UpdateProfileIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.full_name = data.full_name
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password", status_code=status.HTTP_200_OK)
def change_password(
    data: ChangePasswordIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"detail": "Password changed successfully"}
