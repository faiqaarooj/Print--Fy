import datetime
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import User, PrintJob, UniversityForm, DeskState
from .auth import hash_password

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Users
        student = db.query(User).filter(User.email == "faiqa@campus.edu").first()
        if not student:
            student = User(
                name="Faiqa Arooj",
                email="faiqa@campus.edu",
                password_hash=hash_password("password123"),
                student_id="STU-884920",
                role="student",
                title="Design Lead & Engineer"
            )
            db.add(student)
            db.commit()
            db.refresh(student)

        operator = db.query(User).filter(User.email == "operator@campus.edu").first()
        if not operator:
            operator = User(
                name="Print Desk Operator",
                email="operator@campus.edu",
                password_hash=hash_password("password123"),
                role="operator",
                title="Chief Desk Officer"
            )
            db.add(operator)
            db.commit()
            db.refresh(operator)

        # Other mock students for queue realism
        mock_students_data = [
            ("Ahmed Khan", "ahmed@campus.edu", "STU-102931"),
            ("Sara Ali", "sara@campus.edu", "STU-209182"),
            ("Hassan Raza", "hassan@campus.edu", "STU-301928"),
            ("Ayesha Malik", "ayesha@campus.edu", "STU-402918"),
            ("Bilal Tariq", "bilal@campus.edu", "STU-509182"),
            ("Zainab Noor", "zainab@campus.edu", "STU-602918"),
        ]
        created_mock_users = []
        for name, email, sid in mock_students_data:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    name=name,
                    email=email,
                    password_hash=hash_password("password123"),
                    student_id=sid,
                    role="student"
                )
                db.add(u)
                db.commit()
                db.refresh(u)
            created_mock_users.append(u)

        # 2. Desk State
        desk = db.query(DeskState).filter(DeskState.id == 1).first()
        if not desk:
            desk = DeskState(
                id=1,
                printer_status="Online",
                notice=None,
                location="Central Library Desk A",
                desk_name="Central Library · Desk A"
            )
            db.add(desk)
            db.commit()

        # 3. University Forms
        forms_data = [
            {
                "id": "form-01",
                "title": "Fee Challan Form",
                "department": "Accounts & Finance",
                "pages": 1,
                "category": "Accounts",
                "estimated_cost": 10.0,
                "is_popular": True,
                "icon_type": "Receipt",
                "description": "Standard university semester fee challan slip (Student & Bank copies)."
            },
            {
                "id": "form-02",
                "title": "Course Add / Drop Form",
                "department": "Academic Registrar",
                "pages": 2,
                "category": "Registrar",
                "estimated_cost": 20.0,
                "is_popular": True,
                "icon_type": "BookOpen",
                "description": "Required for elective course swapping and credit hour adjustments."
            },
            {
                "id": "form-03",
                "title": "Library Clearance Certificate",
                "department": "Central Library",
                "pages": 1,
                "category": "Library",
                "estimated_cost": 10.0,
                "is_popular": False,
                "icon_type": "CheckSquare",
                "description": "Final clearance document confirming zero overdue book fines."
            },
            {
                "id": "form-04",
                "title": "Hostel Accommodation Application",
                "department": "Student Affairs",
                "pages": 3,
                "category": "Hostel",
                "estimated_cost": 30.0,
                "is_popular": False,
                "icon_type": "Home",
                "description": "Semester boarding and mess registration application."
            },
            {
                "id": "form-05",
                "title": "Transcript / Degree Requisition",
                "department": "Examinations Branch",
                "pages": 2,
                "category": "Registrar",
                "estimated_cost": 20.0,
                "is_popular": True,
                "icon_type": "GraduationCap",
                "description": "Official transcript and provisional degree certificate request."
            },
            {
                "id": "form-06",
                "title": "Student ID Card Replacement",
                "department": "Security & Admin",
                "pages": 1,
                "category": "Admin",
                "estimated_cost": 10.0,
                "is_popular": False,
                "icon_type": "CreditCard",
                "description": "Affidavit and re-issuance form for lost or damaged student cards."
            },
        ]
        for fd in forms_data:
            form = db.query(UniversityForm).filter(UniversityForm.id == fd["id"]).first()
            if not form:
                form = UniversityForm(
                    id=fd["id"],
                    title=fd["title"],
                    department=fd["department"],
                    pages=fd["pages"],
                    category=fd["category"],
                    estimated_cost=fd["estimated_cost"],
                    is_popular=fd["is_popular"],
                    icon_type=fd["icon_type"],
                    description=fd["description"]
                )
                db.add(form)
        db.commit()

        # 4. Sample Queue Jobs
        existing_jobs = db.query(PrintJob).count()
        if existing_jobs == 0:
            sample_jobs = [
                {
                    "id": "job-op-01",
                    "user_id": created_mock_users[0].id,
                    "file_name": "Assignment_3_Report.pdf",
                    "pages": 12,
                    "color_mode": "B&W",
                    "duplex": "Double-sided",
                    "copies": 1,
                    "slot": "9:00 AM",
                    "status": "queued",
                    "payment_status": "paid",
                    "amount_due": 0.0,
                    "pin": "2048",
                    "can_arrive": False,
                },
                {
                    "id": "job-op-02",
                    "user_id": created_mock_users[1].id,
                    "file_name": "Lecture_Notes.pdf",
                    "pages": 8,
                    "color_mode": "Color",
                    "duplex": "Single-sided",
                    "copies": 1,
                    "slot": "9:30 AM",
                    "status": "queued",
                    "payment_status": "unpaid",
                    "amount_due": 120.0,
                    "pin": "5192",
                    "can_arrive": False,
                },
                {
                    "id": "job-op-03",
                    "user_id": created_mock_users[2].id,
                    "file_name": "Research_Paper_Draft.docx",
                    "pages": 20,
                    "color_mode": "B&W",
                    "duplex": "Double-sided",
                    "copies": 1,
                    "slot": "10:00 AM",
                    "status": "printing",
                    "payment_status": "paid",
                    "amount_due": 0.0,
                    "pin": "7721",
                    "can_arrive": True,
                },
                {
                    "id": "job-op-04",
                    "user_id": created_mock_users[3].id,
                    "file_name": "Seminar_Handout.pdf",
                    "pages": 10,
                    "color_mode": "Color",
                    "duplex": "Double-sided",
                    "copies": 1,
                    "slot": "11:00 AM",
                    "status": "ready_for_pickup",
                    "payment_status": "paid",
                    "amount_due": 0.0,
                    "pin": "8312",
                    "can_arrive": True,
                },
                {
                    "id": "job-op-05",
                    "user_id": student.id,
                    "file_name": "Operating_Systems_Project.pdf",
                    "pages": 14,
                    "color_mode": "B&W",
                    "duplex": "Double-sided",
                    "copies": 1,
                    "slot": "11:30 AM",
                    "status": "queued",
                    "payment_status": "paid",
                    "amount_due": 0.0,
                    "pin": "4829",
                    "can_arrive": True,
                }
            ]
            for jd in sample_jobs:
                job = PrintJob(
                    id=jd["id"],
                    user_id=jd["user_id"],
                    file_name=jd["file_name"],
                    pages=jd["pages"],
                    color_mode=jd["color_mode"],
                    duplex=jd["duplex"],
                    copies=jd["copies"],
                    slot=jd["slot"],
                    status=jd["status"],
                    payment_status=jd["payment_status"],
                    amount_due=jd["amount_due"],
                    pin=jd["pin"],
                    can_arrive=jd["can_arrive"],
                    submitted_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=30),
                )
                db.add(job)
            db.commit()

        print("✅ Print-Fy database seeded successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
