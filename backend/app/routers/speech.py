from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional

from app.services.speech_services import transcribe_audio, generate_speech

router = APIRouter()

class TextToSpeechRequest(BaseModel):
    text: str
    language: str = "en"
    voice_type: Optional[str] = "female"

class SpeechToTextResponse(BaseModel):
    text: str
    confidence: float

@router.post("/speech/text-to-speech")
async def convert_text_to_speech(request: TextToSpeechRequest):
    """
    Convert text to speech audio
    """
    try:
        audio_data = await generate_speech(request.text, request.language, request.voice_type)
        return {"audio_data": audio_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text-to-speech conversion failed: {str(e)}")

@router.post("/speech/speech-to-text", response_model=SpeechToTextResponse)
async def convert_speech_to_text(audio_file: UploadFile = File(...), language: str = "en"):
    """
    Convert speech audio to text
    """
    try:
        transcript = await transcribe_audio(audio_file, language)
        print("Transcript: ", transcript)
        return transcript
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech-to-text conversion failed: {str(e)}") 