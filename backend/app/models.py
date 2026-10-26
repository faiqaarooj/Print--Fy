import datetime
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(180), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    student_id = Column(String(50), nullable=True)
    role = Column(String(30), default="student", nullable=False) # 'student' | 'operator' | 'admin'
    title = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    jobs = relationship("PrintJob", back_populates="user")
    tickets = relationship("SupportTicket", back_populates="user")

class PrintJob(Base):
    __tablename__ = "print_jobs"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=True)
    pages = Column(Integer, default=1)
    color_mode = Column(String(20), default="B&W") # 'B&W' | 'Color'
    duplex = Column(String(30), default="Single-sided") # 'Single-sided' | 'Double-sided'
    copies = Column(Integer, default=1)
    slot = Column(String(50), default="9:00 AM")
    status = Column(String(40), default="queued")
    payment_status = Column(String(20), default="paid") # 'paid' | 'unpaid'
    amount_due = Column(Float, default=0.0)
    pin = Column(String(10), default="4829")
    can_arrive = Column(Boolean, default=False)
    can_cancel = Column(Boolean, default=True)
    printed_pages = Column(Integer, default=0)
    issue_note = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    status_updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="jobs")

class UniversityForm(Base):
    __tablename__ = "university_forms"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    department = Column(String(100), nullable=False)
    pages = Column(Integer, default=1)
    category = Column(String(50), default="Registrar")
    estimated_cost = Column(Float, default=10.0)
    is_popular = Column(Boolean, default=False)
    icon_type = Column(String(50), default="FileText")
    description = Column(Text, nullable=True)

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String(100), nullable=False)
    job_id = Column(String(64), nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="open")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="tickets")

class DeskState(Base):
    __tablename__ = "desk_state"

    id = Column(Integer, primary_key=True, default=1)
    printer_status = Column(String(50), default="Online") # 'Online' | 'Offline' | 'Paper Jam' | 'Low Toner'
    notice = Column(String(255), nullable=True)
    location = Column(String(120), default="Central Library Desk A")
    desk_name = Column(String(120), default="Central Library · Desk A")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class PasswordResetOTP(Base):
    __tablename__ = "password_reset_otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(180), index=True, nullable=False)
    code = Column(String(10), nullable=False)
    reset_token = Column(String(128), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
