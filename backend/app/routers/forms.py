import random
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import UniversityForm, PrintJob, User
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["University Forms"])

@router.get("/forms")
def get_forms(db: Session = Depends(get_db)):
    forms = db.query(UniversityForm).all()
    result = []
    for f in forms:
        result.append({
            "id": f.id,
            "title": f.title,
            "department": f.department,
            "pages": f.pages,
            "category": f.category,
            "estimatedCost": f.estimated_cost,
            "isPopular": f.is_popular,
            "iconType": f.icon_type,
            "description": f.description,
        })
    return {"data": result}

@router.post("/forms/{form_id}/print-job")
def create_form_print_job(
    form_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    form = db.query(UniversityForm).filter(UniversityForm.id == form_id).first()
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University form not found."
        )

    job_id = f"job-form-{uuid.uuid4().hex[:8]}"
    pin = f"{random.randint(1000, 9999)}"

    job = PrintJob(
        id=job_id,
        user_id=current_user.id,
        file_name=f"{form.title}.pdf",
        pages=form.pages,
        color_mode="B&W",
        duplex="Single-sided",
        copies=1,
        slot="9:30 AM",
        status="queued",
        payment_status="paid", # University forms pre-approved / debit
        amount_due=0.0,
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
            "jobId": job.id,
            "pin": job.pin,
            "title": form.title,
            "status": "queued"
        },
        "message": f'Print job created for "{form.title}".'
    }
