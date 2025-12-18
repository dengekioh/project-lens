import json
import google.generativeai as genai
from app.config import config

# Initialize Gemini Model using the config
if config.GEMINI_API_KEY:
    genai.configure(api_key=config.GEMINI_API_KEY)
    # Using the fast and cost-effective Flash model
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None
    print("Warning: AI features disabled due to missing API Key.")

async def analyze_article(content: str):
    """
    Sends the article content to Google Gemini for analysis based on the system prompt.
    
    Args:
        content (str): The raw text of the article.
        
    Returns:
        dict: The analysis result in JSON format.
    """
    if not model:
        return {"error": "AI not configured"}
    
    if not config.SYSTEM_PROMPT:
        return {"error": "System prompt not loaded"}

    # Construct the final prompt by combining the System Role + User Input
    # Truncate content to 3000 chars to save tokens and avoid errors
    full_prompt = f"{config.SYSTEM_PROMPT}\n\n## News Input:\n{content[:3000]}"

    try:
        print("🤖 Calling Gemini Async...")
        # Execute async API call
        response = await model.generate_content_async(full_prompt)
        
        # Clean up the response (remove potential markdown code blocks)
        # Gemini sometimes wraps JSON in ```json ... ```
        clean_text = response.text.strip().replace("```json", "").replace("```", "")
        
        # Parse string into Python dictionary
        return json.loads(clean_text)

    except json.JSONDecodeError:
        print("Error: AI returned invalid JSON.")
        return {"error": "Failed to parse AI response"}
    except Exception as e:
        print(f"AI Analysis Failed: {e}")
        return {"error": str(e)}