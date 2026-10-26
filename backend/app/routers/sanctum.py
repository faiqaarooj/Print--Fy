import secrets
from fastapi import APIRouter, Response
from ..config import CSRF_COOKIE_NAME

router = APIRouter(tags=["Sanctum"])

@router.get("/sanctum/csrf-cookie")
def get_csrf_cookie(response: Response):
    token = secrets.token_hex(20)
    # Set XSRF-TOKEN cookie readable by frontend JavaScript
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=token,
        httponly=False,
        samesite="lax",
        secure=False,
        path="/"
    )
    return {"message": "CSRF cookie set", "token": token}
