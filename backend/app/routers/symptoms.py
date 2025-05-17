from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import traceback
import logging

from app.services.symptom_analysis import analyze_symptoms
from app.services.symptom_chat_processing import process_conversation

router = APIRouter()

class PainArea(BaseModel):
    area: str
    intensity: int
    description: str
    
class SymptomInput(BaseModel):
    pain_areas: List[PainArea]
    additional_symptoms: List[str] = []
    emotional_state: Optional[str] = None

class TriageResult(BaseModel):
    severity: str  # "green", "yellow", or "red"
    recommendation: str
    summary: str

class Message(BaseModel):
    role: str  # "system" or "user"
    content: str

class ConversationInput(BaseModel):
    conversation: List[Message]
    current_symptoms: Optional[Dict[str, Any]] = None

class ConversationResponse(BaseModel):
    response: str
    updated_symptoms: Optional[Dict[str, Any]] = None
    
@router.post("/symptoms/analyze", response_model=TriageResult)
async def analyze_user_symptoms(symptom_data: SymptomInput):
    """
    Analyze the user's symptoms and provide a triage result
    """
    try:
        result = analyze_symptoms(symptom_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze symptoms: {str(e)}")

@router.post("/symptoms/conversation", response_model=ConversationResponse)
async def process_symptom_conversation(conversation_data: ConversationInput):
    """
    Process the conversation about symptoms and guide the user to provide more information if needed.
    Returns a response and potentially updated symptom data.
    """
    try:
        print("Received conversation data:", conversation_data)
        result = process_conversation(conversation_data.conversation, conversation_data.current_symptoms)
        return result
    except Exception as e:
        error_traceback = traceback.format_exc()
        print(f"Error processing conversation: {str(e)}")
        print(f"Traceback: {error_traceback}")
        raise HTTPException(status_code=500, detail=f"Failed to process conversation: {str(e)}") 