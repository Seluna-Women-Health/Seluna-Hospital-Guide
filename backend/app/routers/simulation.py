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

# Base steps without dialog or tips - these will be filled by the LLM
BASE_SIMULATION_STEPS = [
    {
        "id": "arrival",
        "title": "Arriving at the Clinic",
        "description": "What to expect when you arrive at the gynecological clinic",
        "image_url": "/images/1_Hospital-Check-in.png",
        "illustration": "arrival.svg",
    },
    {
        "id": "check-in",
        "title": "Check-in Process",
        "description": "How to complete the check-in process at the front desk",
        "image_url": "/images/1_Hospital-Check-in.png",
        "illustration": "checkin.svg",
    },
    {
        "id": "nurse-intake",
        "title": "Nurse Intake",
        "description": "How the nurse will collect your initial information and health history",
        "image_url": "/images/2.2_Nurse Interview Scene_with_translator2.png",
        "illustration": "nurse_intake.svg",
    },
    {
        "id": "changing-clothes",
        "title": "Changing Clothes",
        "description": "What to expect when changing into a hospital gown for examination",
        "image_url": "/images/3_Diverse-Women-Portrait.png",
        "illustration": "changing.svg",
    },
    {
        "id": "waiting-room",
        "title": "Waiting Room",
        "description": "What to do while waiting for your appointment",
        "image_url": "/images/3_Diverse-Women-Portrait.png",
        "illustration": "waiting.svg",
    },
    {
        "id": "doctor-enters",
        "title": "Doctor Enters",
        "description": "What happens when the doctor comes to see you",
        "image_url": "/images/3_Diverse-Women-Portrait.png",
        "illustration": "doctor_enters.svg",
    },
    {
        "id": "blood-test",
        "title": "Blood Test",
        "description": "What to expect during a blood test procedure",
        "image_url": "/images/3_Diverse-Women-Portrait.png",
        "illustration": "blood_test.svg",
    },
    {
        "id": "pelvic-exam",
        "title": "Pelvic Exam",
        "description": "What happens during a pelvic examination (optional, skippable)",
        "video_url": "/videos/Ultrasound_Examination_storyboard.mp4",
        "illustration": "pelvic_exam.svg",
    },
    {
        "id": "test-results",
        "title": "Test Results",
        "description": "How test results are shared and explained",
        "image_url": "/images/3_Diverse-Women-Portrait.png",
        "illustration": "test_results.svg",
    },
    {
        "id": "pharmacy-info",
        "title": "Pharmacy Information",
        "description": "Understanding prescriptions and pharmacy instructions",
        "image_url": "/images/3_Diverse-Women-Portrait.png",
        "illustration": "pharmacy.svg",
    },
    {
        "id": "what-to-bring",
        "title": "What to Bring",
        "description": "Items to bring for future appointments",
        "image_url": "/images/3_Diverse-Women-Portrait.png",
        "illustration": "what_to_bring.svg",
    },
    {
        "id": "closing",
        "title": "Closing Encouragement",
        "description": "Final tips and encouragement for your healthcare journey",
        "image_url": "/images/3_Diverse-Women-Portrait.png",
        "illustration": "closing.svg",
    },
]

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
    video_url: Optional[str] = None
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
            
        # Add emotional context
        # emotion_status = symptom_data
            
    print("symptom context: ", symptom_context)

    # Customize instructions for each step
    if step_id == "arrival":
        specific_instructions = """
Keep it light and welcoming. This step is more about orientation than medical questions.
Limit dialog pairs to 1. Focus on welcoming tone.
"""
    elif step_id == "check-in":
        specific_instructions = """
Avoid detailed medical questions. Focus on registration, paperwork, and what the front desk staff might ask.
Limit to 2-3 dialog pairs and practical tips like ID and insurance card.
"""
    elif step_id == "nurse-intake":
        specific_instructions = """
Include 3–4 dialog pairs. The nurse collects key health history.
Questions might include reason for visit, pain level, medical history, and vitals.
"""
    elif step_id == "changing-clothes":
        specific_instructions = """
No medical questions. Instead, offer reassurance about privacy and choice.
Use 1 dialog pair max, and 2–3 tips about gown use and personal boundaries.
"""
    elif step_id == "waiting-room":
        specific_instructions = """
There is no active dialog. Provide calm support and advice on what to expect next.
Use 0–1 dialog pairs and 2–3 tips for staying relaxed and prepared.
"""
    elif step_id == "doctor-enters":
        specific_instructions = """
Start of doctor-patient interaction. Use 3–5 dialog pairs: warm greeting, small talk, reason for visit.
Build trust and introduce the purpose of the visit.
"""
    elif step_id == "blood-test":
        specific_instructions = """
Use 1–2 dialog pairs. Focus on the nurse/technician explaining the blood test and calming the patient.
Include tips about hydration and looking away during needle use.
"""
    elif step_id == "pelvic-exam":
        specific_instructions = """
Use 3–5 dialog pairs. Explain each step with consent and comfort.
Include specific language about what might happen and that it's optional.
"""
    elif step_id == "test-results":
        specific_instructions = """
Use 2–3 dialog pairs about receiving results. Doctor explains the findings, next steps, and asks if the patient has questions.
Include tips for taking notes or asking clarifying questions.
"""
    elif step_id == "pharmacy-info":
        specific_instructions = """
Use 1–2 dialog pairs. Focus on explaining prescriptions, side effects, and how to ask for help if confused.
Tips about generic brands and asking the pharmacist questions.
"""
    elif step_id == "what-to-bring":
        specific_instructions = """
No dialog needed. Just give 3–4 checklist-style tips about what to bring to appointments.
"""
    elif step_id == "closing":
        specific_instructions = """
Use 1 dialog pair. Doctor or assistant offers encouragement.
Tips can include reminder to set follow-up and self-care suggestions.
"""
    else:
        specific_instructions = ""

    print("specific instructions: ", specific_instructions)
    
    # Construct prompt based on the current step
    prompt = f"""
        Generate realistic doctor-patient dialog and helpful tips for a hospital visit simulation.

        Current step: {step_title}
        Step description: {step_description}
        Step ID: {step_id}
        Specific instructions: {specific_instructions}
        Symptom context: {symptom_context}

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

        Keep the dialog realistic, compassionate, and informative. Depending on the step, adjust the number of dialog pairs (0–5) and tips (1–3).
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