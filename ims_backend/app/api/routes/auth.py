# app/api/routes/auth.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordIn,
    LoginIn,
    RegisterIn,
    ResetPasswordIn,
    TokenOut,
    UserOut,
)
from app.services.auth_service import (
    login_user,
    register_user,
    reset_password_with_otp,
    send_password_reset_otp,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    _user, token = register_user(db, data)
    return TokenOut(access_token=token)


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    _user, token = login_user(db, data)
    return TokenOut(access_token=token)


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(data: ForgotPasswordIn, db: Session = Depends(get_db)):
    send_password_reset_otp(db, data.email)
    # Always return 200 to not leak whether email exists
    return {"detail": "If this email is registered you will receive an OTP shortly"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(data: ResetPasswordIn, db: Session = Depends(get_db)):
    reset_password_with_otp(db, data.email, data.otp, data.new_password)
    return {"detail": "Password reset successfully"}
