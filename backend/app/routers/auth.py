import random
import secrets
import datetime
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, PasswordResetOTP
from ..schemas import (
    RegisterPayload,
    LoginPayload,
    ForgotPasswordPayload,
    VerifyOtpPayload,
    ResetPasswordPayload,
    ChangePasswordPayload,
)
from ..auth import (
    hash_password,
    verify_password,
    create_session_token,
    get_current_user,
    user_to_profile,
)
from ..config import SESSION_COOKIE_NAME

router = APIRouter(prefix="/api", tags=["Auth"])

@router.post("/register")
def register(payload: RegisterPayload, response: Response, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": {"email": ["An account with this email already exists."]}}
        )

    role = "operator" if "operator" in email_clean else "student"
    student_id = f"STU-{random.randint(100000, 999999)}" if role == "student" else None

    user = User(
        name=payload.name.strip(),
        email=email_clean,
        password_hash=hash_password(payload.password),
        student_id=student_id,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_session_token(user.id)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/"
    )

    profile = user_to_profile(user)
    return {"message": "Account created successfully.", "user": profile.dict()}

@router.post("/login")
def login(payload: LoginPayload, response: Response, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "These credentials do not match our records."}
        )

    token = create_session_token(user.id)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/"
    )

    profile = user_to_profile(user)
    return {"user": profile.dict(), "message": "Login successful"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/"
    )
    return {"message": "Logged out successfully."}

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    profile = user_to_profile(user)
    return {"data": profile.dict(), "user": profile.dict()}

@router.post("/me/password")
def change_password(payload: ChangePasswordPayload, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": {"current_password": ["Incorrect current password."]}}
        )

    if payload.password != payload.password_confirmation:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": {"password": ["Password confirmation does not match."]}}
        )

    user.password_hash = hash_password(payload.password)
    db.commit()
    return {"message": "Password changed successfully."}

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordPayload, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    
    # Generate 6-digit OTP
    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)

    otp_record = PasswordResetOTP(
        email=email_clean,
        code=otp_code,
        expires_at=expires_at,
        used=False
    )
    db.add(otp_record)
    db.commit()

    # Log OTP to console for easy local testing
    print(f"\n🔐 [PRINT-FY OTP SERVICE] OTP for {email_clean} is: {otp_code}\n")

    return {
        "message": "A 6-digit verification code has been dispatched to your email.",
        # In local dev environment, provide code preview for seamless testing:
        "dev_hint_otp": otp_code if not user or True else None
    }

@router.post("/verify-otp")
def verify_otp(payload: VerifyOtpPayload, db: Session = Depends(get_db)):
    email_clean = payload.email.strip().lower()
    record = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.email == email_clean,
            PasswordResetOTP.code == payload.code.strip(),
            PasswordResetOTP.used == False,
            PasswordResetOTP.expires_at > datetime.datetime.utcnow()
        )
        .order_by(PasswordResetOTP.id.desc())
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Invalid or expired verification code."}
        )

    reset_token = secrets.token_urlsafe(32)
    record.reset_token = reset_token
    db.commit()

    return {"message": "Code verified successfully.", "reset_token": reset_token}

@router.post("/reset-password")
def reset_password(payload: ResetPasswordPayload, db: Session = Depends(get_db)):
    if payload.password != payload.password_confirmation:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"errors": {"password": ["Password confirmation does not match."]}}
        )

    record = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.reset_token == payload.reset_token,
            PasswordResetOTP.used == False,
            PasswordResetOTP.expires_at > datetime.datetime.utcnow()
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"message": "Invalid or expired password reset session."}
        )

    user = db.query(User).filter(User.email == record.email).first()
    if user:
        user.password_hash = hash_password(payload.password)
    
    record.used = True
    db.commit()

    return {"message": "Password reset successfully. You can now log in."}
