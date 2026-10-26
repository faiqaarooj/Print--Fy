from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import DeskState, PrintJob
from ..queue_engine import ACTIVE_STATUSES

router = APIRouter(prefix="/api", tags=["Desk"])

@router.get("/desk")
def get_desk(db: Session = Depends(get_db)):
    state = db.query(DeskState).filter(DeskState.id == 1).first()
    if not state:
        state = DeskState(
            id=1,
            printer_status="Online",
            notice=None,
            location="Central Library Desk A",
            desk_name="Central Library · Desk A"
        )
        db.add(state)
        db.commit()
        db.refresh(state)

    active_count = db.query(PrintJob).filter(PrintJob.status.in_(ACTIVE_STATUSES)).count()
    est_wait = active_count * 3 if active_count > 0 else 0

    return {
        "data": {
            "printerStatus": state.printer_status,
            "notice": state.notice,
            "location": state.location,
            "deskName": state.desk_name,
            "queueTrafficCount": active_count,
            "estimatedWaitMinutes": est_wait
        }
    }
