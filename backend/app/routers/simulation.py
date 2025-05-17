from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import json
from app.services.llm import LLM  # Import the LLM service
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()

class DialogPair(BaseModel):
    doctor_dialog: str
    user_guidance: str

class SimulationStep(BaseModel):
    id: str
    title: str
    description: str
    tips: List[str]
    image_url: Optional[str] = None
    audio_url: Optional[str] = None
    dialog_pairs: List[DialogPair] = []
    illustration: Optional[str] = None

class SymptomData(BaseModel):
    symptoms: List[Dict[str, Any]]
    pain_level: Optional[int] = None
    pain_location: Optional[str] = None
    duration: Optional[str] = None
    additional_notes: Optional[str] = None

# Initialize the LLM service with a medical-focused system prompt
simulation_llm = LLM(
    name="simulation_dialog_generator",
    system_prompt="You are a helpful assistant that generates realistic and compassionate medical dialog and tips for patients visiting a gynecological clinic."
)

async def generate_dialog_with_llm(step_id: str, step_title: str, step_description: str, symptom_data: Optional[SymptomData] = None) -> Dict:
    """
    Use LLM to generate doctor dialog, user guidance, and tips based on the current step and symptom data
    """
    # Format symptom information for the prompt
    symptom_context = ""
    if symptom_data and symptom_data.symptoms:
        main_symptoms = ", ".join([s.get("name", "unknown symptom") for s in symptom_data.symptoms[:3]])
        pain_desc = f" with pain level {symptom_data.pain_level}/10" if symptom_data.pain_level else ""
        location = f" in the {symptom_data.pain_location}" if symptom_data.pain_location else ""
        duration = f" for {symptom_data.duration}" if symptom_data.duration else ""
        
        symptom_context = f"The patient is experiencing {main_symptoms}{location}{pain_desc}{duration}. "
        if symptom_data.additional_notes:
            symptom_context += f"Additional context: {symptom_data.additional_notes}"
    
    # Construct prompt based on the current step
    prompt = f"""
    Generate realistic doctor-patient dialog and helpful tips for a hospital visit simulation.
    
    Current step: {step_title}
    Step description: {step_description}
    Step ID: {step_id}
    
    {symptom_context}
    
    Format your response as JSON with the following structure:
    {{
        "dialog_pairs": [
            {{
                "doctor_dialog": "What the doctor/healthcare provider might say in this scenario",
                "user_guidance": "Guidance for how the patient should respond or what to expect"
            }},
            {{
                "doctor_dialog": "A follow-up question or statement from the healthcare provider",
                "user_guidance": "Further guidance for the patient"
            }}
        ],
        "tips": [
            "A helpful tip for the patient during this step",
            "Another practical piece of advice"
        ]
    }}
    
    Keep the dialog realistic, compassionate, and informative. Include 1-2 dialog pairs and 2-3 tips.
    IMPORTANT: Return ONLY the JSON object without any markdown formatting (no ```json or ``` markers).
    """
    
    try:
        # Use the LLM service instead of direct OpenAI calls
        response_content = simulation_llm.chat(prompt)
        
        # Parse and return the response
        try:
            # First try direct JSON parsing
            return json.loads(response_content)
        except json.JSONDecodeError:
            # If direct parsing fails, try to extract JSON from markdown code blocks
            print(f"Error parsing direct JSON. Response starts with: {response_content[:200]}...")
            
            # Extract JSON from markdown code blocks if present
            import re
            json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response_content)
            
            if json_match:
                json_content = json_match.group(1).strip()
                try:
                    return json.loads(json_content)
                except json.JSONDecodeError:
                    print(f"Failed to parse extracted JSON: {json_content[:200]}...")
            
            # If we still can't extract valid JSON, return fallback
            return create_fallback_response(step_title)
            
    except Exception as e:
        # Fallback content in case of error
        print(f"LLM error: {str(e)}")
        return create_fallback_response(step_title)

def create_fallback_response(step_title: str) -> Dict:
    """Create a fallback response when LLM fails"""
    return {
        "dialog_pairs": [
            {
                "doctor_dialog": f"Hello, welcome to the {step_title} stage of your visit.",
                "user_guidance": f"Listen carefully and follow the guidance for {step_title}."
            }
        ],
        "tips": [
            f"Be prepared for {step_title}",
            "Ask questions if anything is unclear"
        ]
    }

# Base steps without dialog or tips - these will be filled by the LLM
BASE_SIMULATION_STEPS = [
    {
        "id": "arrival",
        "title": "Arriving at the Clinic",
        "description": "What to expect when you arrive at the gynecological clinic",
        "image_url": "/images/simulation/arrival.jpg",
        "illustration": "arrival.svg",
    },
    {
        "id": "check-in",
        "title": "Check-in Process",
        "description": "How to complete the check-in process at the front desk",
        "image_url": "/images/simulation/checkin.jpg",
        "illustration": "checkin.svg",
    },
    {
        "id": "nurse-intake",
        "title": "Nurse Intake",
        "description": "How the nurse will collect your initial information and health history",
        "image_url": "/images/simulation/nurse_intake.jpg",
        "illustration": "nurse_intake.svg",
    },
    {
        "id": "changing-clothes",
        "title": "Changing Clothes",
        "description": "What to expect when changing into a hospital gown for examination",
        "image_url": "/images/simulation/changing.jpg",
        "illustration": "changing.svg",
    },
    {
        "id": "waiting-room",
        "title": "Waiting Room",
        "description": "What to do while waiting for your appointment",
        "image_url": "/images/simulation/waiting.jpg",
        "illustration": "waiting.svg",
    },
    {
        "id": "doctor-enters",
        "title": "Doctor Enters",
        "description": "What happens when the doctor comes to see you",
        "image_url": "/images/simulation/doctor_enters.jpg",
        "illustration": "doctor_enters.svg",
    },
    {
        "id": "blood-test",
        "title": "Blood Test",
        "description": "What to expect during a blood test procedure",
        "image_url": "/images/simulation/blood_test.jpg",
        "illustration": "blood_test.svg",
    },
    {
        "id": "pelvic-exam",
        "title": "Pelvic Exam",
        "description": "What happens during a pelvic examination (optional, skippable)",
        "image_url": "/images/simulation/pelvic_exam.jpg",
        "illustration": "pelvic_exam.svg",
    },
    {
        "id": "test-results",
        "title": "Test Results",
        "description": "How test results are shared and explained",
        "image_url": "/images/simulation/test_results.jpg",
        "illustration": "test_results.svg",
    },
    {
        "id": "pharmacy-info",
        "title": "Pharmacy Information",
        "description": "Understanding prescriptions and pharmacy instructions",
        "image_url": "/images/simulation/pharmacy.jpg",
        "illustration": "pharmacy.svg",
    },
    {
        "id": "what-to-bring",
        "title": "What to Bring",
        "description": "Items to bring for future appointments",
        "image_url": "/images/simulation/what_to_bring.jpg",
        "illustration": "what_to_bring.svg",
    },
    {
        "id": "closing",
        "title": "Closing Encouragement",
        "description": "Final tips and encouragement for your healthcare journey",
        "image_url": "/images/simulation/closing.jpg",
        "illustration": "closing.svg",
    },
]

@router.get("/simulation/steps", response_model=List[SimulationStep])
async def get_simulation_steps(language: str = "en"):
    """
    Get the hospital visit simulation steps
    """
    try:
        # Create simulation steps with empty dialog_pairs and tips
        # In a real implementation, these could come from a database
        steps = [SimulationStep(**step, tips=[], dialog_pairs=[]) for step in BASE_SIMULATION_STEPS]
        return steps
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch simulation steps: {str(e)}")

@router.get("/simulation/steps/{step_id}", response_model=SimulationStep)
async def get_simulation_step(step_id: str, language: str = "en"):
    """
    Get a specific step in the hospital visit simulation
    """
    try:
        steps = await get_simulation_steps(language)
        for step in steps:
            if step.id == step_id:
                return step
        raise HTTPException(status_code=404, detail=f"Step with ID {step_id} not found")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to fetch simulation step: {str(e)}")

@router.post("/simulation/generate-step-content/{step_id}", response_model=SimulationStep)
async def generate_step_content(step_id: str, symptom_data: Optional[SymptomData] = Body(None), language: str = "en"):
    """
    Generate LLM-powered content for a specific simulation step based on symptom data
    """
    try:
        # Find the requested step
        steps = await get_simulation_steps(language)
        step = None
        for s in steps:
            if s.id == step_id:
                step = s
                break
        
        if not step:
            raise HTTPException(status_code=404, detail=f"Step with ID {step_id} not found")
        
        # Generate dialog and tips with LLM
        llm_response = await generate_dialog_with_llm(
            step_id=step.id,
            step_title=step.title,
            step_description=step.description,
            symptom_data=symptom_data
        )
        print("simulated response: ", llm_response)
        
        # Update the step with LLM-generated content
        if "dialog_pairs" in llm_response:
            step.dialog_pairs = [DialogPair(**pair) for pair in llm_response["dialog_pairs"]]
        
        if "tips" in llm_response:
            step.tips = llm_response["tips"]
        
        return step
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to generate step content: {str(e)}")

@router.post("/simulation/personalized-steps", response_model=List[SimulationStep])
async def get_personalized_simulation_steps(symptom_data: SymptomData = Body(...), language: str = "en"):
    """
    Get personalized hospital visit simulation steps based on the user's symptoms
    """
    try:
        # Get the base steps
        steps = await get_simulation_steps(language)
        
        # Generate personalized content for each step
        personalized_steps = []
        for step in steps:
            # Generate content for this step
            llm_response = await generate_dialog_with_llm(
                step_id=step.id,
                step_title=step.title,
                step_description=step.description,
                symptom_data=symptom_data
            )
            
            # Update the step with LLM-generated content
            if "dialog_pairs" in llm_response:
                step.dialog_pairs = [DialogPair(**pair) for pair in llm_response["dialog_pairs"]]
            
            if "tips" in llm_response:
                step.tips = llm_response["tips"]
            
            personalized_steps.append(step)
        
        return personalized_steps
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate personalized simulation: {str(e)}")

@router.post("/simulation/generate-batch", response_model=List[SimulationStep])
async def generate_batch_content(step_ids: List[str] = Body(...), symptom_data: Optional[SymptomData] = Body(None), language: str = "en"):
    """
    Generate LLM-powered content for a batch of simulation steps (typically the next 1-2 steps)
    """
    try:
        # Get all steps first
        all_steps = await get_simulation_steps(language)
        
        # Filter to only the requested steps
        steps_to_generate = [step for step in all_steps if step.id in step_ids]
        
        if not steps_to_generate:
            raise HTTPException(status_code=404, detail="No valid steps found for the provided IDs")
        
        # Generate content for each requested step
        result_steps = []
        for step in steps_to_generate:
            print("generate step information for step ", step)
            # Generate dialog and tips with LLM
            llm_response = await generate_dialog_with_llm(
                step_id=step.id,
                step_title=step.title,
                step_description=step.description,
                symptom_data=symptom_data
            )
            
            # Update the step with LLM-generated content
            if "dialog_pairs" in llm_response:
                step.dialog_pairs = [DialogPair(**pair) for pair in llm_response["dialog_pairs"]]
            
            if "tips" in llm_response:
                step.tips = llm_response["tips"]
            
            result_steps.append(step)
        
        return result_steps
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to generate batch content: {str(e)}") 