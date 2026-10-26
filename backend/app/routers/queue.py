import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PrintJob, User
from ..auth import get_current_user_optional, get_current_user
from ..schemas import ChangeSlotPayload
from ..queue_engine import build_student_queue

router = APIRouter(prefix="/api", tags=["Queue"])

@router.get("/queue")
def get_queue(
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    jobs = db.query(PrintJob).all()
    user_id = current_user.id if current_user else None
    queue_data = build_student_queue(jobs, user_id)
    return {"data": queue_data}

@router.post("/jobs/{job_id}/slot")
def change_slot(
    job_id: str,
    payload: ChangeSlotPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(PrintJob).filter(PrintJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Print job not found."
        )

    # Permission check: student can only change their own job
    if job.user_id != current_user.id and current_user.role not in ["operator", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to modify this job's slot."
        )

    job.slot = payload.slot
    job.status_updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(job)

    # Recalculate full queue and find updated job
    all_jobs = db.query(PrintJob).all()
    queue_data = build_student_queue(all_jobs, current_user.id)
    updated_job_data = next((j for j in queue_data if str(j["id"]) == str(job_id)), None)

    return {
        "data": {
            "job": updated_job_data,
            "queue": queue_data
        }
    }

@router.post("/jobs/{job_id}/check-in")
def check_in(
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
            detail="You are not authorized to check in for this job."
        )

    # Transition state to waiting_for_student / ready
    if job.status == 'queued':
        job.status = 'waiting_for_student'
    job.can_arrive = True
    job.status_updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(job)

    all_jobs = db.query(PrintJob).all()
    queue_data = build_student_queue(all_jobs, current_user.id)
    updated_job_data = next((j for j in queue_data if str(j["id"]) == str(job_id)), None)

    return {
        "data": {
            "success": True,
            "job": updated_job_data,
            "queue": queue_data
        }
    }

@router.post("/jobs/{job_id}/cancel")
def cancel_job(
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
            detail="You are not authorized to cancel this job."
        )

    if job.status in ['printing', 'ready_for_pickup', 'collected']:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Cannot cancel job when status is '{job.status}'."
        )

    job.status = 'cancelled'
    job.can_cancel = False
    job.status_updated_at = datetime.datetime.utcnow()
    db.commit()

    all_jobs = db.query(PrintJob).all()
    queue_data = build_student_queue(all_jobs, current_user.id)

    return {
        "data": {
            "success": True,
            "message": "Print job cancelled successfully.",
            "queue": queue_data
        }
    }
