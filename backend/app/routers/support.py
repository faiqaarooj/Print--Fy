from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import SupportTicket, PrintJob, User
from ..auth import get_current_user
from ..schemas import SupportTicketPayload

router = APIRouter(prefix="/api", tags=["Support"])

@router.post("/support-tickets")
def create_support_ticket(
    payload: SupportTicketPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket = SupportTicket(
        user_id=current_user.id,
        topic=payload.topic,
        job_id=payload.job_id,
        message=payload.message,
        status="open"
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return {
        "message": "Your support ticket has been logged with the campus desk team.",
        "ticket_id": ticket.id
    }

@router.delete("/saved-documents")
def delete_saved_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Mark user's active jobs as cancelled and delete finished jobs
    db.query(PrintJob).filter(
        PrintJob.user_id == current_user.id,
        PrintJob.status.in_(["collected", "cancelled", "failed"])
    ).delete(synchronize_session=False)

    db.commit()

    return {"message": "All saved history and temporary print files have been purged."}
