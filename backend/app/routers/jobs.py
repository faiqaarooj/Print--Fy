import os
import random
import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PrintJob, User
from ..auth import get_current_user
from ..config import UPLOAD_DIR
from ..schemas import QueueJobResponse

router = APIRouter(prefix="/api", tags=["Jobs"])

@router.post("/jobs/upload")
async def upload_job(
    file: Optional[UploadFile] = File(None),
    file_name: Optional[str] = Form(None),
    pages: int = Form(1),
    color_mode: str = Form("B&W"),
    duplex: str = Form("Single-sided"),
    copies: int = Form(1),
    slot: str = Form("9:00 AM"),
    payment_status: str = Form("unpaid"),
    amount_due: float = Form(0.0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    saved_file_name = file.filename if file else (file_name or "Document.pdf")
    file_path = None

    if file:
        file_ext = os.path.splitext(file.filename)[1]
        unique_name = f"{uuid.uuid4().hex}{file_ext}"
        target_path = UPLOAD_DIR / unique_name
        contents = await file.read()
        with open(target_path, "wb") as f:
            f.write(contents)
        file_path = str(target_path)

    rate_per_page = 15.0 if color_mode == "Color" else 10.0
    calculated_amount = (pages or 1) * (copies or 1) * rate_per_page
    final_amount = amount_due if amount_due > 0 else calculated_amount

    # Generate fresh 4-digit PIN for collection
    pin = f"{random.randint(1000, 9999)}"
    job_id = f"job-{uuid.uuid4().hex[:8]}"

    job = PrintJob(
        id=job_id,
        user_id=current_user.id,
        file_name=saved_file_name,
        file_path=file_path,
        pages=pages,
        color_mode=color_mode,
        duplex=duplex,
        copies=copies,
        slot=slot,
        status="queued",
        payment_status=payment_status,
        amount_due=final_amount if payment_status == "unpaid" else 0.0,
        pin=pin,
        can_arrive=False,
        can_cancel=True,
        submitted_at=datetime.datetime.utcnow(),
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "data": {
            "id": job.id,
            "fileName": job.file_name,
            "pages": job.pages,
            "colorMode": job.color_mode,
            "duplex": job.duplex,
            "slot": job.slot,
            "status": job.status,
            "paymentStatus": job.payment_status,
            "amountDue": job.amount_due,
            "pin": job.pin,
            "submittedAt": job.submitted_at.isoformat(),
        },
        "message": "Print job uploaded and added to queue."
    }

@router.post("/jobs/{job_id}/pay")
def pay_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(PrintJob).filter(PrintJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Print job not found."
        )

    if job.user_id != current_user.id and current_user.role not in ["operator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to pay for this job."
        )

    job.payment_status = "paid"
    job.amount_due = 0.0
    job.status_updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(job)

    return {"message": "Payment confirmed successfully.", "data": {"jobId": job.id, "paymentStatus": "paid"}}

@router.get("/my-jobs")
def get_my_jobs(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    jobs = (
        db.query(PrintJob)
        .filter(PrintJob.user_id == current_user.id)
        .order_by(PrintJob.submitted_at.desc())
        .limit(limit)
        .all()
    )

    items = []
    for j in jobs:
        items.append({
            "id": j.id,
            "fileName": j.file_name,
            "pages": j.pages,
            "colorMode": j.color_mode,
            "duplex": j.duplex,
            "slot": j.slot,
            "status": j.status,
            "paymentStatus": j.payment_status,
            "amountDue": j.amount_due,
            "pin": j.pin,
            "submittedAt": j.submitted_at.isoformat() if j.submitted_at else None,
        })

    return {"data": items}
