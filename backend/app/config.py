import os
import base64
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """
    Centralized configuration management.
    """
    
    # 1. Gemini API Key
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

    # 2. Decode the Base64 System Prompt
    # We read the encoded string from env and decode it back to UTF-8 text
    _encoded_prompt = os.getenv("PROMPT_B64_DECODER", "")
    
    SYSTEM_PROMPT = ""
    
    if _encoded_prompt:
        try:
            SYSTEM_PROMPT = base64.b64decode(_encoded_prompt).decode("utf-8")
        except Exception as e:
            print(f"Error decoding system prompt: {e}")
            SYSTEM_PROMPT = "Error: Could not decode system prompt."
    else:
        print("Warning: PROMPT_B64_DECODER not found in environment variables.")

# Create a singleton instance (optional, but good for access)
config = Config()