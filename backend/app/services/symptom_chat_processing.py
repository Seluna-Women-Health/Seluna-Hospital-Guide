from typing import Dict, List, Any, Optional
import re
from app.services.llm import LLM

# Initialize the LLM with appropriate system prompts
symptom_extractor_llm = LLM(
    name="symptom_extractor",
    system_prompt="""
    You are a medical assistant specializing in extracting symptoms from conversations.
    
    Extract all symptoms mentioned by the user, focusing on:
    1. Pain areas (abdomen, head, back, chest, pelvis, leg, arm)
    2. Pain descriptions (sharp, dull, throbbing, burning, cramping)
    3. Pain intensity (on a scale of 1-10)
    4. Additional symptoms (fever, nausea, vomiting, dizziness, fatigue, bleeding, discharge, swelling, rash, itching)
    5. Emotional state (anxious, depressed, frustrated, normal)
    
    Format your response as a structured JSON object without any explanations:
    {
        "pain_areas": [
            {"area": "area_name", "intensity": intensity_value, "description": "description_text"}
        ],
        "additional_symptoms": ["symptom1", "symptom2"],
        "emotional_state": "state_name"
    }
    """
)

conversation_guide_llm = LLM(
    name="conversation_guide",
    system_prompt="""
    You are a compassionate medical assistant for a women's health application.
    
    Based on the symptoms the user has shared, respond with empathy and guide them to provide more comprehensive information.
    
    If symptoms are incomplete, ask follow-up questions about:
    1. Location of pain
    2. Intensity of pain (1-10 scale)
    3. Quality of pain (sharp, dull, etc.)
    4. Duration of symptoms
    5. Associated symptoms
    6. Emotional impact
    
    Keep your responses concise, supportive, and focused on gathering relevant medical information.
    If you have enough information, summarize what you understand and ask if there's anything else they'd like to share.
    You should respond within 2 sentences, and guide the user to provide information step by step.
    """
)

def process_conversation(conversation: List[Dict], current_symptoms: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Process the conversation about symptoms using LLM and guide the user to provide more information if needed.
    Returns a response and potentially updated symptom data.
    """
    # Initialize symptoms if not provided
    if current_symptoms is None:
        current_symptoms = {
            "pain_areas": [],
            "additional_symptoms": [],
            "emotional_state": None
        }
    
    # Get the last user message
    last_user_message = None
    for message in reversed(conversation):
        if message.role == "user":
            last_user_message = message.content
            break
    
    if not last_user_message:
        return {
            "response": "Hello! Please describe your symptoms. Where are you experiencing pain or discomfort?",
            "updated_symptoms": current_symptoms
        }
    
    print(f"Last user message: {last_user_message}")
    
    # Extract symptoms using LLM
    try:
        # Convert conversation to the format expected by the LLM
        llm_conversation = [{"role": msg.role, "content": msg.content} for msg in conversation]
        
        # Use LLM to extract symptoms
        extracted_symptoms_json = symptom_extractor_llm.chat(
            message="Extract symptoms from this conversation.",
            context=llm_conversation
        )
        
        # Parse the JSON response
        import json
        from json.decoder import JSONDecodeError
        
        try:
            extracted_symptoms = json.loads(extracted_symptoms_json)
            print(f"Extracted symptoms: {extracted_symptoms}")
            
            # Merge with existing symptoms
            updated_symptoms = merge_symptoms(current_symptoms, extracted_symptoms)
        except JSONDecodeError:
            print(f"Failed to parse LLM response as JSON: {extracted_symptoms_json}")
            # Fall back to current symptoms if JSON parsing fails
            updated_symptoms = current_symptoms
    except Exception as e:
        print(f"Error extracting symptoms with LLM: {str(e)}")
        # Fall back to current symptoms if LLM fails
        updated_symptoms = current_symptoms
    
    # Generate response based on the symptoms
    try:
        # Prepare symptom summary for the conversation guide
        symptom_summary = format_symptoms_for_llm(updated_symptoms)
        
        # Use LLM to generate response
        response = conversation_guide_llm.chat(
            message=f"The user has shared these symptoms: {symptom_summary}\n\nLast message: {last_user_message}\n\nRespond appropriately.",
            context=llm_conversation
        )
        
        print(f"Agent response: {response}")
    except Exception as e:
        print(f"Error generating response with LLM: {str(e)}")
        # Fall back to a generic response if LLM fails
        response = "I understand you're not feeling well. Could you tell me more about your symptoms?"
    
    return {
        "response": response,
        "updated_symptoms": updated_symptoms
    }

def merge_symptoms(current_symptoms: Dict[str, Any], new_symptoms: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge existing symptoms with newly extracted symptoms
    """
    merged = current_symptoms.copy()
    
    # Merge pain areas
    existing_areas = {area.get("area"): area for area in merged["pain_areas"]}
    for new_area in new_symptoms.get("pain_areas", []):
        area_name = new_area.get("area")
        if area_name in existing_areas:
            # Update existing area if new information is provided
            if "intensity" in new_area and new_area["intensity"] is not None:
                existing_areas[area_name]["intensity"] = new_area["intensity"]
            if "description" in new_area and new_area["description"]:
                existing_areas[area_name]["description"] = new_area["description"]
        else:
            # Add new area
            merged["pain_areas"].append(new_area)
    
    # Merge additional symptoms
    current_additional = set(merged["additional_symptoms"])
    new_additional = set(new_symptoms.get("additional_symptoms", []))
    merged["additional_symptoms"] = list(current_additional.union(new_additional))
    
    # Update emotional state if provided
    if new_symptoms.get("emotional_state"):
        merged["emotional_state"] = new_symptoms["emotional_state"]
    
    return merged

def format_symptoms_for_llm(symptoms: Dict[str, Any]) -> str:
    """
    Format symptoms as a readable string for the LLM
    """
    parts = []
    
    # Format pain areas
    if symptoms["pain_areas"]:
        pain_parts = []
        for area in symptoms["pain_areas"]:
            description = area.get("description", "pain")
            intensity = area.get("intensity", "unspecified intensity")
            pain_parts.append(f"{description} in {area['area']} (intensity: {intensity}/10)")
        parts.append("Pain: " + ", ".join(pain_parts))
    
    # Format additional symptoms
    if symptoms["additional_symptoms"]:
        parts.append("Additional symptoms: " + ", ".join(symptoms["additional_symptoms"]))
    
    # Format emotional state
    if symptoms["emotional_state"]:
        parts.append(f"Emotional state: {symptoms['emotional_state']}")
    
    if not parts:
        return "No symptoms described yet."
    
    return "; ".join(parts)

# Keep legacy functions for fallback
def extract_symptoms(message: str, current_symptoms: Dict[str, Any]) -> Dict[str, Any]:
    """Legacy function - extract symptom information using regex"""
    # Implementation remains as a fallback
    # ... [keep the existing implementation]

def generate_guided_response(symptoms: Dict[str, Any]) -> str:
    """Legacy function - generate guided response based on symptoms"""
    # Implementation remains as a fallback
    # ... [keep the existing implementation]

def extract_symptoms_from_text(text: str, language: str = "en") -> Dict[str, Any]:
    """
    Extract symptom information from natural language text
    
    In a real implementation, this would use NLP techniques or an LLM
    to understand symptoms described in natural language.
    """
    # This is a simplified mock implementation
    # In a real app, this would use more sophisticated NLP
    
    # Sample keywords to detect
    pain_keywords = {
        "abdomen": ["stomach", "belly", "abdominal", "tummy"],
        "lower back": ["back", "spine", "lumbar"],
        "pelvis": ["pelvic", "lower abdomen", "groin"],
        "head": ["headache", "migraine", "temple"]
    }
    
    intensity_keywords = {
        "mild": 3,
        "moderate": 5,
        "severe": 8,
        "unbearable": 10
    }
    
    symptom_keywords = [
        "nausea", "vomiting", "dizziness", "fatigue", 
        "fever", "bleeding", "discharge", "cramps"
    ]
    
    # Simple keyword spotting (very basic approach)
    found_areas = []
    for area, keywords in pain_keywords.items():
        if any(keyword in text.lower() for keyword in keywords):
            # Default intensity
            intensity = 5
            
            # Check for intensity descriptions
            for desc, value in intensity_keywords.items():
                if desc in text.lower():
                    intensity = value
                    break
            
            found_areas.append({
                "area": area,
                "intensity": intensity,
                "description": "pain" # Default description
            })
    
    # Find additional symptoms
    additional_symptoms = []
    for symptom in symptom_keywords:
        if symptom in text.lower():
            additional_symptoms.append(symptom)
    
    # Detect emotional state based on keywords
    emotional_state = None
    if "worried" in text.lower() or "anxious" in text.lower():
        emotional_state = "😟"
    elif "sad" in text.lower() or "depressed" in text.lower():
        emotional_state = "😔"
    
    return {
        "pain_areas": found_areas,
        "additional_symptoms": additional_symptoms,
        "emotional_state": emotional_state
    }

def generate_follow_up_questions(symptoms: Dict[str, Any]) -> List[str]:
    """
    Generate follow-up questions based on the symptoms provided
    
    In a real implementation, this would be more sophisticated.
    """
    questions = []
    
    # Ask about duration for each pain area
    for area in symptoms.get("pain_areas", []):
        questions.append(f"How long have you had pain in your {area['area']}?")
    
    # Ask about triggers
    if symptoms.get("pain_areas"):
        questions.append("Does anything make the pain better or worse?")
    
    # Ask about related symptoms based on reported symptoms
    if "nausea" in symptoms.get("additional_symptoms", []):
        questions.append("Have you experienced any vomiting along with the nausea?")
    
    if "bleeding" in symptoms.get("additional_symptoms", []):
        questions.append("Could you describe the amount and color of the bleeding?")
    
    # Always ask about medication
    questions.append("Have you taken any medication for these symptoms?")
    
    return questions[:3]  # Limit to 3 questions to avoid overwhelming the user 