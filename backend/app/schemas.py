from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr

class RegisterPayload(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginPayload(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordPayload(BaseModel):
    email: EmailStr

class VerifyOtpPayload(BaseModel):
    email: EmailStr
    code: str

class ResetPasswordPayload(BaseModel):
    reset_token: str
    password: str
    password_confirmation: str

class ChangePasswordPayload(BaseModel):
    current_password: str
    password: str
    password_confirmation: str

class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    studentId: Optional[str] = None
    role: str = "student"
    title: Optional[str] = None
    initials: Optional[str] = None

class QueueJobResponse(BaseModel):
    id: str
    slot: str
    submittedAt: str
    status: str
    position: Optional[int] = None
    isUserJob: Optional[bool] = False
    fileName: Optional[str] = None
    name: Optional[str] = None
    genericAlias: Optional[str] = None
    pages: Optional[int] = 1
    colorMode: Optional[str] = "B&W"
    duplex: Optional[str] = "Single-sided"
    canArrive: Optional[bool] = False
    canCancel: Optional[bool] = False
    paymentStatus: Optional[str] = "paid"
    amountDue: Optional[float] = 0.0
    pin: Optional[str] = None
    estimatedWaitMinutes: Optional[int] = 0
    progress: Optional[int] = 0
    statusUpdatedAt: Optional[str] = None

class ChangeSlotPayload(BaseModel):
    slot: str

class DeskInfo(BaseModel):
    printerStatus: Optional[str] = "Online"
    notice: Optional[str] = None
    location: Optional[str] = "Central Library Desk A"
    deskName: Optional[str] = "Central Library · Desk A"
    queueTrafficCount: Optional[int] = 0
    estimatedWaitMinutes: Optional[int] = 0

class UniversityFormResponse(BaseModel):
    id: str
    title: str
    department: str
    pages: int
    category: str
    estimatedCost: float
    isPopular: bool
    iconType: str
    description: Optional[str] = None

class SupportTicketPayload(BaseModel):
    topic: str
    job_id: Optional[str] = None
    message: str

class OperatorJobStatusPayload(BaseModel):
    status: str
    issue_note: Optional[str] = None

class OperatorDeskNoticePayload(BaseModel):
    printer_status: Optional[str] = None
    notice: Optional[str] = None
