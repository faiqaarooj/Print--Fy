import re
import datetime
from typing import List, Dict, Any, Optional
from .models import PrintJob, User

ACTIVE_STATUSES = {
    'queued',
    'almost_your_turn',
    'waiting_for_student',
    'printing'
}

def parse_slot_time(slot_str: str) -> int:
    """Parses slot string into minutes from midnight for robust chronological sorting."""
    if not slot_str:
        return 999999
    
    # Try ISO date parsing
    try:
        dt = datetime.datetime.fromisoformat(slot_str.replace("Z", "+00:00"))
        return dt.hour * 60 + dt.minute
    except Exception:
        pass

    match = re.search(r'(\d{1,2}):(\d{2})\s*(AM|PM)?', slot_str, re.IGNORECASE)
    if match:
        hour = int(match.group(1))
        minute = int(match.group(2))
        ampm = (match.group(3) or "").upper()

        if ampm == 'PM' and hour < 12:
            hour += 12
        elif ampm == 'AM' and hour == 12:
            hour = 0
        return hour * 60 + minute

    return 999999

def sort_jobs(jobs: List[PrintJob]) -> List[PrintJob]:
    """Sorts active jobs: slot time -> submitted_at -> id."""
    def sort_key(job: PrintJob):
        slot_minutes = parse_slot_time(job.slot)
        sub_time = job.submitted_at.timestamp() if job.submitted_at else 0
        return (slot_minutes, sub_time, str(job.id))

    return sorted(jobs, key=sort_key)

def build_student_queue(jobs: List[PrintJob], current_user_id: Optional[int]) -> List[Dict[str, Any]]:
    """
    Sorts jobs, assigns 1-based sequential positions to active jobs,
    and applies strict privacy masking to non-owner jobs.
    """
    # Exclude collected or cancelled jobs from active live student queue
    active_jobs = [j for j in jobs if j.status in ACTIVE_STATUSES or j.status in ['ready', 'ready_for_pickup']]
    sorted_jobs = sort_jobs(active_jobs)

    result = []
    alias_index = 0
    alias_map: Dict[int, str] = {}

    for idx, job in enumerate(sorted_jobs):
        position = idx + 1
        is_user = (current_user_id is not None and job.user_id == current_user_id)
        
        # Determine privacy alias for non-owners
        if not is_user:
            if job.user_id not in alias_map:
                letter = chr(65 + (alias_index % 26))
                suffix = f" {alias_index // 26 + 1}" if alias_index >= 26 else ""
                alias_map[job.user_id] = f"Student {letter}{suffix}"
                alias_index += 1
            generic_alias = alias_map[job.user_id]
        else:
            generic_alias = None

        submitted_iso = job.submitted_at.isoformat() if job.submitted_at else datetime.datetime.utcnow().isoformat()
        status_updated_iso = job.status_updated_at.isoformat() if job.status_updated_at else submitted_iso

        item: Dict[str, Any] = {
            "id": job.id,
            "slot": job.slot,
            "submittedAt": submitted_iso,
            "status": job.status,
            "position": position,
            "isUserJob": is_user,
            "statusUpdatedAt": status_updated_iso,
            "estimatedWaitMinutes": max(1, position * 3),
        }

        if is_user:
            item.update({
                "name": job.user.name if job.user else "You",
                "fileName": job.file_name,
                "pages": job.pages,
                "colorMode": job.color_mode,
                "duplex": job.duplex,
                "canArrive": bool(position <= 3 or job.can_arrive),
                "canCancel": bool(job.can_cancel and job.status not in ['printing', 'ready_for_pickup']),
                "paymentStatus": job.payment_status,
                "amountDue": job.amount_due,
                "pin": job.pin,
                "progress": 75 if job.status == 'printing' else (100 if job.status == 'ready_for_pickup' else 0),
            })
        else:
            # Mask all PII for other students
            item.update({
                "genericAlias": generic_alias,
                "name": generic_alias,
                "fileName": "Document.pdf",
                "pages": None,
                "colorMode": None,
                "duplex": None,
                "canArrive": False,
                "canCancel": False,
                "paymentStatus": None,
                "amountDue": None,
                "pin": None,
                "progress": None,
            })

        result.append(item)

    return result

def build_operator_queue(jobs: List[PrintJob]) -> List[Dict[str, Any]]:
    """Returns full unmasked queue details for authorized desk operators."""
    sorted_jobs = sort_jobs(jobs)
    result = []

    for idx, job in enumerate(sorted_jobs):
        position = idx + 1 if job.status in ACTIVE_STATUSES else None
        submitted_iso = job.submitted_at.isoformat() if job.submitted_at else datetime.datetime.utcnow().isoformat()
        status_updated_iso = job.status_updated_at.isoformat() if job.status_updated_at else submitted_iso

        result.append({
            "id": job.id,
            "position": position,
            "name": job.user.name if job.user else "Unknown Student",
            "studentId": job.user.student_id if job.user else "",
            "fileName": job.file_name,
            "pages": job.pages,
            "colorMode": job.color_mode,
            "duplex": job.duplex,
            "copies": job.copies,
            "slot": job.slot,
            "submittedAt": submitted_iso,
            "status": job.status,
            "paymentStatus": job.payment_status,
            "amountDue": job.amount_due,
            "pin": job.pin,
            "canArrive": bool(position is not None and position <= 3 or job.can_arrive),
            "printedPages": job.printed_pages,
            "issueNote": job.issue_note,
            "statusUpdatedAt": status_updated_iso,
        })

    return result
