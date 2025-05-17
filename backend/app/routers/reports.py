from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.services.pdf_generator import generate_pdf_report

router = APIRouter()

class SymptomSummary(BaseModel):
    pain_areas: List[dict]
    pain_descriptions: List[str]
    additional_symptoms: List[str]
    triage_result: str
    
class ReportRequest(BaseModel):
    user_name: Optional[str] = None
    symptom_summary: SymptomSummary
    notes: Optional[str] = None
    language: str = "en"
    
@router.post("/reports/generate")
async def create_report(report_request: ReportRequest):
    """
    Generate a PDF report from the user's symptom data
    """
    try:
        report_data = await generate_pdf_report(
            report_request.symptom_summary,
            report_request.user_name,
            report_request.notes,
            report_request.language
        )
        return {"report_data": report_data, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}") 