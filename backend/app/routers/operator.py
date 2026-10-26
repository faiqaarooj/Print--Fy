import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PrintJob, DeskState, User
from ..auth import require_operator
from ..schemas import OperatorJobStatusPayload, OperatorDeskNoticePayload
from ..queue_engine import build_operator_queue

router = APIRouter(prefix="/api/operator", tags=["Operator"])

@router.get("/queue")
def get_operator_queue(
    operator: User = Depends(require_operator),
    db: Session = Depends(get_db)
):
    jobs = db.query(PrintJob).all()
    queue_data = build_operator_queue(jobs)
    return {"data": queue_data}

@router.post("/jobs/{job_id}/status")
def update_job_status(
    job_id: str,
    payload: OperatorJobStatusPayload,
    operator: User = Depends(require_operator),
    db: Session = Depends(get_db)
):
    job = db.query(PrintJob).filter(PrintJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Print job not found."
        )

    allowed_statuses = {
        'queued',
        'almost_your_turn',
        'waiting_for_student',
        'printing',
        'ready_for_pickup',
        'collected',
        'failed',
        'cancelled'
    }

    if payload.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status '{payload.status}'."
        )

    job.status = payload.status
    if payload.issue_note:
        job.issue_note = payload.issue_note
    job.status_updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(job)

    all_jobs = db.query(PrintJob).all()
    return {
        "message": f"Job status updated to '{payload.status}'.",
        "data": build_operator_queue(all_jobs)
    }

@router.post("/desk/status")
def update_desk_status(
    payload: OperatorDeskNoticePayload,
    operator: User = Depends(require_operator),
    db: Session = Depends(get_db)
):
    desk = db.query(DeskState).filter(DeskState.id == 1).first()
    if not desk:
        desk = DeskState(id=1)
        db.add(desk)

    if payload.printer_status is not None:
        desk.printer_status = payload.printer_status
    if payload.notice is not None:
        desk.notice = payload.notice if payload.notice.strip() else None

    desk.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(desk)

    return {
        "message": "Desk status updated successfully.",
        "data": {
            "printerStatus": desk.printer_status,
            "notice": desk.notice,
            "location": desk.location,
            "deskName": desk.desk_name
        }
    }
