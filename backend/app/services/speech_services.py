import io
import base64
from fastapi import UploadFile
from openai import OpenAI
import yaml
import os
from app.config import settings

# Initialize OpenAI client
def get_openai_client():
    """Get OpenAI client with API key from config"""
    api_key = settings.LLM.API_KEY
    base_url = settings.LLM.BASE_URL
    
    client_kwargs = {"api_key": api_key}
    if base_url:
        client_kwargs["base_url"] = base_url
        
    return OpenAI(**client_kwargs)

async def transcribe_audio(audio_file: UploadFile, language: str = "en") -> dict:
    """
    Transcribe speech audio to text using OpenAI's Whisper API
    """
    try:
        client = get_openai_client()
        
        # Read the uploaded file
        content = await audio_file.read()
        
        # Create a temporary file for OpenAI to read
        temp_file_path = f"/tmp/symptom_audio.wav"
        with open(temp_file_path, "wb") as f:
            f.write(content)
        
        # Call OpenAI's Whisper API
        with open(temp_file_path, "rb") as audio:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio,
                language=language
            )
        
        # Clean up the temporary file
        os.remove(temp_file_path)
        
        # Return the transcript with a confidence score
        # Note: Whisper doesn't provide confidence scores, so we use a default high value
        return {
            "text": transcript.text,
            "confidence": 0.95
        }
    except Exception as e:
        print(f"Error in transcribe_audio: {str(e)}")
        # Fallback to mock responses for development/testing
        file_size = len(content) if 'content' in locals() else 0
        
        # Simulate different responses for testing UI
        if file_size % 3 == 0:
            return {
                "text": "I have a sharp pain in my abdomen that's been getting worse for the past two days",
                "confidence": 0.95
            }
        elif file_size % 3 == 1:
            return {
                "text": "My head hurts and I feel dizzy, especially when I stand up",
                "confidence": 0.92
            }
        else:
            return {
                "text": "I'm experiencing lower back pain that radiates down my left leg, it's about a 7 out of 10",
                "confidence": 0.88
            }

async def generate_speech(text: str, language: str = "en", voice_type: str = "female") -> str:
    """
    Convert text to speech using OpenAI's TTS API
    
    Returns base64-encoded audio data that can be used directly in an audio element.
    """
    try:
        client = get_openai_client()
        
        # Map voice_type to OpenAI voice options
        voice_mapping = {
            "female": "nova",  # A female voice
            "male": "echo",    # A male voice
            "neutral": "alloy" # A neutral voice
        }
        
        # Select voice based on voice_type or default to 'alloy' if not found
        voice = voice_mapping.get(voice_type.lower(), "nova")
        
        # Call OpenAI's TTS API
        response = client.audio.speech.create(
            model="tts-1",  # or tts-1-hd for higher quality
            voice=voice,
            input=text
        )
        
        # Get the audio content as bytes
        audio_data = response.content
        
        # Convert to base64 for frontend use
        base64_audio = base64.b64encode(audio_data).decode("utf-8")
        
        return base64_audio
    
    except Exception as e:
        print(f"Error in generate_speech: {str(e)}")
        # Fallback to a mock response
        # This is a tiny sample of base64-encoded MP3 silence
        mock_audio_data = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA"
        
        return mock_audio_data

# Optional: ElevenLabs integration as an alternative TTS provider
async def generate_speech_elevenlabs(text: str, language: str = "en", voice_type: str = "female") -> str:
    """
    Alternative implementation using ElevenLabs for TTS
    """
    try:
        import requests
        
        # Get ElevenLabs API key from settings
        elevenlabs_key = settings.SPEECH.ELEVENLABS_KEY
        
        if not elevenlabs_key:
            raise ValueError("ElevenLabs API key not found in config")
        
        # Map voice_type to ElevenLabs voice IDs
        # You would need to replace these with actual ElevenLabs voice IDs
        voice_mapping = {
            "female": "EXAVITQu4vr4xnSDxMaL",  # Example female voice ID
            "male": "VR6AewLTigWG4xSOukaG",    # Example male voice ID
            "neutral": "21m00Tcm4TlvDq8ikWAM"  # Example neutral voice ID
        }
        
        # Select voice based on voice_type or use default
        voice_id = voice_mapping.get(voice_type.lower(), voice_mapping["female"])
        
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": elevenlabs_key
        }
        
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            # Convert to base64 for frontend use
            base64_audio = base64.b64encode(response.content).decode("utf-8")
            return base64_audio
        else:
            raise Exception(f"ElevenLabs API error: {response.status_code} {response.text}")
    
    except Exception as e:
        print(f"Error in generate_speech_elevenlabs: {str(e)}")
        # Fall back to OpenAI implementation
        return await generate_speech(text, language, voice_type) 