from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import traceback
import logging

from app.services.symptom_analysis import analyze_symptoms
from app.services.symptom_chat_processing import process_conversation
from app.services.conversation_service import (
    create_conversation, 
    get_conversation,
    add_message,
    update_symptoms,
    get_messages,
    get_symptoms
)
from app.services.diagnosis_recommendation import generate_diagnosis_recommendation

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

class MessageRequest(BaseModel):
    conversation_id: str
    content: str

class ConversationRequest(BaseModel):
    conversation_id: Optional[str] = None

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

@router.post("/symptoms/conversation/start")
async def start_conversation():
    """Start a new conversation and return the conversation ID"""
    conversation_id = create_conversation()
    
    return {
        "conversation_id": conversation_id,
        "messages": get_messages(conversation_id),
        "symptoms": get_symptoms(conversation_id)
    }

@router.post("/symptoms/message")
async def add_conversation_message(message_data: MessageRequest):
    """
    Add a user message to a conversation
    
    Request body contains:
    - conversation_id: The ID of the conversation
    - content: The user's message
    """
    conversation_id = message_data.conversation_id
    
    # Get current conversation data
    conversation = get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Add user message
    add_message(conversation_id, "user", message_data.content)
    
    # Process conversation
    conversation_data = get_conversation(conversation_id)
    result = process_conversation(
        conversation=conversation_data["messages"],
        current_symptoms=conversation_data["symptoms"]
    )
    
    # Add system response
    add_message(conversation_id, "system", result["response"])
    
    # Update symptoms
    if "updated_symptoms" in result:
        update_symptoms(conversation_id, result["updated_symptoms"])
    
    # Return updated conversation
    return {
        "conversation_id": conversation_id,
        "messages": get_messages(conversation_id),
        "symptoms": get_symptoms(conversation_id)
    }

@router.get("/symptoms/conversation")
async def get_conversation_data(conversation_id: str):
    """Get conversation data using a query parameter"""
    conversation = get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {
        "conversation_id": conversation_id,
        "messages": conversation["messages"],
        "symptoms": conversation["symptoms"]
    }

@router.post("/symptoms/diagnosis")
async def get_diagnosis_recommendation(symptoms: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """
    Generate a diagnosis recommendation based on provided symptoms
    """
    try:
        recommendation = generate_diagnosis_recommendation(symptoms)
        return recommendation
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate diagnosis recommendation: {str(e)}"
        ) 