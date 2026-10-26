from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from ..ai_engine import ai_engine
from ..models import User
from ..auth import get_current_user_optional

router = APIRouter(prefix="/api/ai", tags=["AI Studio"])

class DocumentAnalysisRequest(BaseModel):
    file_name: str
    pages: int = 1
    color_mode: str = "B&W"
    duplex: str = "Single-sided"

class StudyCopilotRequest(BaseModel):
    prompt: str
    context_file: Optional[str] = "Document.pdf"

@router.post("/analyze-document")
def analyze_document(payload: DocumentAnalysisRequest):
    result = ai_engine.analyze_document_smart_print(
        file_name=payload.file_name,
        total_pages=payload.pages,
        color_mode=payload.color_mode,
        duplex=payload.duplex
    )
    return {"data": result, "status": "success"}

@router.post("/study-copilot")
def ask_copilot(payload: StudyCopilotRequest):
    result = ai_engine.ask_study_copilot(
        prompt=payload.prompt,
        context_file=payload.context_file
    )
    return {"data": result, "status": "success"}

@router.get("/rush-prediction")
def get_rush_prediction():
    result = ai_engine.predict_rush_hours()
    return {"data": result, "status": "success"}
