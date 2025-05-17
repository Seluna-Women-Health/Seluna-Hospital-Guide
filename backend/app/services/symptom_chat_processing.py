from typing import Dict, List, Any, Optional
import re
import json
from json.decoder import JSONDecodeError
from app.services.llm import LLM


# First LLM for summarizing symptoms
symptom_summarizer_llm = LLM(
    name="symptom_summarizer",
    system_prompt="""
    You are a medical assistant specializing in identifying symptoms from conversations.
    
    Your task is to extract and summarize the symptoms mentioned by the user into two categories:
    1. Main symptoms - primary health concerns
    2. Other symptoms - secondary or related symptoms
    
    Guidelines:
    - Each symptom should be 1-2 words only
    - Use standardized medical terminology when possible
    - Focus on the symptoms themselves, not their characteristics
    - Extract only symptoms explicitly mentioned by the user
    - For women's health specifically, look for symptoms like:
      - Pelvic pain
      - Bloating
      - Irregular periods
      - Cramping
      - Fatigue
      - Nausea
      - Headaches
      - Back pain
      - Mood changes
    - If the user claims that she doesn't have other symptoms, set the additional_symptoms to ["no other symptoms"]
    
    Format your response as a structured JSON object:
    ```json
    {
      "main_symptoms": ["pelvic pain", "bloating"],
      "other_symptoms": ["fatigue", "headache"]
    }
    ```
    """
)

# Modified LLM for detailed symptom extraction
symptom_extractor_llm = LLM(
    name="symptom_extractor",
    system_prompt="""
    You are a medical assistant specializing in extracting detailed symptom information from conversations.
    
    Using both the conversation and the previously identified symptoms, extract detailed information focusing on:
    1. Pain areas (abdomen, head, back, chest, pelvis, leg, arm)
    2. Pain descriptions (sharp, dull, throbbing, burning, cramping)
    3. Pain intensity (on a scale of 1-10)
    4. Pain frequency (very often, often, sometimes, rarely)
    5. Emotional state (anxious, depressed, frustrated, normal)
    6. Emotional scale if not normal (1-10)
    
    Format your response as a structured JSON object with a completeness score:
    ```json
    {
      "pain_areas": [
        {"area": "pelvis", "intensity": 7, "frequency": "often", "description": "sharp"}
      ],
      "main_symptoms": ["pelvic pain"],
      "additional_symptoms": ["bloating", "irregular periods"],
      "emotional_state": "anxious",
      "emotional_scale": 6,
      "completeness_score": 70
    }
    ```
    The specification of each field is as follows:
    - pain_areas: a list of pain areas with intensity and frequency extracted from the conversation
    - main_symptoms: the primary symptoms reported by the user (use the main_symptoms identified in the previous step)
    - additional_symptoms: secondary symptoms reported by the user (use the other_symptoms identified in the previous step)
    - emotional_state: the emotional state of the user extracted from the conversation
    - emotional_scale: the emotional scale of the user extracted from the conversation
    - completeness_score: the completeness score of the symptom information (0-100)
    
    Note:   
    - If a field is mentioned but not specified (e.g., pain without intensity), use null for that value
    - If user mentions information that already exists in the JSON object, update the value with the new information
    """
)

# LLM specifically for generating responses
response_generator_llm = LLM(
    name="response_generator",
    system_prompt="""
    You are a compassionate medical assistant for a women's health application.
    
    Your task is to generate appropriate follow-up questions based on the symptom summary provided.
    
    The summary should include:    
    1. Pain areas (abdomen, head, back, chest, pelvis, leg, arm)
    2. Pain descriptions (sharp, dull, throbbing, burning, cramping)
    3. Pain intensity (on a scale of 1-10)
    4. Pain frequency (very often, often, sometimes, rarely)
    5. Symptoms for women's health specifically:
       - Pelvic pain
       - Bloating or abdominal swelling
       - Pain during intercourse
       - Changes in bowel movements or urinary habits
       - Irregular menstrual periods
       - Nausea or vomiting
       - Lower back pain
       - Difficulty getting pregnant
    6. Emotional state (anxious, depressed, frustrated, normal)
    7. Emotional scale if not normal (1-10)
    
    Based on the symptom summary, determine what information is missing and what follow-up question(s) to ask:
    - Choose the most important 1-2 missing pieces of information to ask about
    - Be empathetic and supportive in your response
    - Keep responses concise (2 sentences maximum)
    - If you have all information needed, summarize and ask if there's anything else
    - Once all fields are complete and the user has nothing else to add, prompt the user to summarize their symptoms
    
    Format your output as follows:
    ```json
    {
      "missing_information": ["pain intensity", "emotional impact"],
      "is_complete": false,
      "follow_up_question": "I understand you're experiencing pelvic pain. On a scale of 1-10, how would you rate the intensity of this pain?"
    }
    ```
    
    If the symptom summary has a completeness score of 80 or higher, you should set "is_complete" to true and ask the user to click the "Estimate Diagnosis" button.
    Don't ask user to summarize their symptoms again.
    """
)

# Add this helper function to extract JSON from a markdown-formatted string
def extract_json_from_markdown(markdown_text):
    """
    Extract JSON content from markdown-formatted text that might contain code blocks
    """
    import re
    # Look for content between JSON code blocks
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', markdown_text)
    
    if json_match:
        # Return the content inside the code block
        return json_match.group(1).strip()
    
    # If no code blocks found, return the original text (it might be raw JSON)
    return markdown_text.strip()

def process_conversation(conversation: List[Dict], current_symptoms: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Process the conversation about symptoms using a two-step LLM approach:
    1. First extract and summarize key symptoms
    2. Then extract detailed information about those symptoms and generate follow-up
    
    Returns a response and potentially updated symptom data.
    """
    # Initialize symptoms if not provided
    if current_symptoms is None:
        current_symptoms = {
            "pain_areas": [],
            "main_symptoms": [],
            "additional_symptoms": [],
            "emotional_state": None,
            "emotional_scale": None,
            "completeness_score": 0
        }
    
    # Get the last user message
    last_user_message = None
    for message in reversed(conversation):
        if message["role"] == "user":
            last_user_message = message["content"]
            break
    
    if not last_user_message:
        return {
            "response": "Hello! Please describe your symptoms. Where are you experiencing pain or discomfort?",
            "updated_symptoms": current_symptoms
        }
    
    print(f"Last user message: {last_user_message}")
    
    try:
        # STEP 1: First identify and summarize the symptoms
        summary_json_raw = symptom_summarizer_llm.chat(
            message="Extract and summarize the symptoms from this conversation.",
            context=conversation
        )
        
        # Clean the response to extract the actual JSON
        summary_json = extract_json_from_markdown(summary_json_raw)
        
        print(f"Symptom Summary Result (cleaned): {summary_json}")
        
        try:
            # Parse the symptom summary
            symptom_summary = json.loads(summary_json)
            
            # STEP 2: Extract detailed information about these symptoms
            detailed_prompt = f"""
            Based on the conversation and these previously identified symptoms:
            {json.dumps(symptom_summary, indent=2)}
            
            Extract detailed information about these symptoms including pain areas, intensity, frequency, etc.
            """
            
            symptom_json_raw = symptom_extractor_llm.chat(
                message=detailed_prompt,
                context=conversation
            )
            
            # Clean the response to extract the actual JSON
            symptom_json = extract_json_from_markdown(symptom_json_raw)
            
            print(f"Detailed Symptom Extraction Result (cleaned): {symptom_json}")
            
            # Parse the extracted detailed symptoms
            extracted_symptoms = json.loads(symptom_json)
            
            # Merge the symptom summary with the detailed extraction
            # Important: preserve the symptom lists from the first step
            if "symptoms" in extracted_symptoms and "main_symptoms" not in extracted_symptoms:
                extracted_symptoms["main_symptoms"] = symptom_summary.get("main_symptoms", [])
            
            if "other_symptoms" in symptom_summary and "additional_symptoms" not in extracted_symptoms:
                extracted_symptoms["additional_symptoms"] = symptom_summary.get("other_symptoms", [])
            
            # STEP 3: Generate response based on the extracted symptoms
            symptoms_summary = json.dumps(extracted_symptoms, indent=2)
            print(f"Symptoms Summary: {symptoms_summary}")
            
            response_json_raw = response_generator_llm.chat(
                message=f"Generate a response based on this symptom summary:\n{symptoms_summary}",
                context=None  # No need to send the full conversation, just the symptom summary
            )
            
            # Clean the response to extract the actual JSON
            response_json = extract_json_from_markdown(response_json_raw)
            
            print(f"Response Generation Result (cleaned): {response_json}")
            
            # Parse the response
            response_data = json.loads(response_json)
            
            # Get the follow-up question
            response = response_data.get("follow_up_question", 
                      "Could you tell me more about your symptoms?")
            
            # Update the symptoms based on the extraction
            updated_symptoms = {
                "pain_areas": extracted_symptoms.get("pain_areas", current_symptoms["pain_areas"]),
                
                # Get main_symptoms directly first, then from symptom_summary, then fallback
                "main_symptoms": extracted_symptoms.get("main_symptoms", 
                         symptom_summary.get("main_symptoms",
                         current_symptoms.get("main_symptoms", []))),
                
                # Get additional_symptoms directly first, then from symptom_summary (other_symptoms), then fallback
                "additional_symptoms": extracted_symptoms.get("additional_symptoms", 
                              symptom_summary.get("other_symptoms",
                              current_symptoms.get("additional_symptoms", []))),
                
                "emotional_state": extracted_symptoms.get("emotional_state", current_symptoms["emotional_state"]),
                "emotional_scale": extracted_symptoms.get("emotional_scale", current_symptoms["emotional_scale"]),
                "completeness_score": extracted_symptoms.get("completeness_score", 0)
            }
            
            return {
                "response": response,
                "updated_symptoms": updated_symptoms
            }
            
        except JSONDecodeError as e:
            print(f"Failed to parse JSON: {str(e)}")
            print(f"Raw content: {symptom_json}")
            # Fall back to a generic response if JSON parsing fails
            return {
                "response": "I understand you're not feeling well. Could you tell me more specifically about where you're experiencing discomfort?",
                "updated_symptoms": current_symptoms
            }
            
    except Exception as e:
        print(f"Error processing conversation with LLM: {str(e)}")
        # Fall back to a generic response if LLM fails
        return {
            "response": "I'm sorry, I couldn't process that. Could you describe your symptoms again, focusing on where you feel pain or discomfort?",
            "updated_symptoms": current_symptoms
        }
