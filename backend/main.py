from fastapi import FastAPI, HTTPException
from app.schemas import ScrapeRequest
from app.services.scraper import fetch_article
from app.services.ai_analyzer import analyze_article

app = FastAPI()

@app.get("/")
async def read_root():
    """
    Health check endpoint.
    """
    return {"message": "Project Lens Backend V3.1 (Refactored Service Layer)"}

@app.post("/scrape")
async def scrape_endpoint(request: ScrapeRequest):
    """
    Main endpoint to process news articles.
    1. Receives URL.
    2. Scrapes content (Async).
    3. Analyzes with AI using the Decoder V5 Prompt (Async).
    4. Returns structured JSON.
    """
    try:
        print(f"Processing URL: {request.url}")
        
        # Step 1: Scrape the article (Service Layer)
        article = await fetch_article(request.url)
        
        if not article.title:
            return {"error": "Failed to retrieve article title"}

        # Step 2: Analyze using AI (Service Layer)
        # The prompt is now securely loaded from config
        ai_result = await analyze_article(article.text)

        # Step 3: Return combined response
        return {
            "title": article.title,
            "content": article.text[:200] + "...",  # Preview only
            "url": request.url,
            "analysis": ai_result
        }
        
    except Exception as e:
        print(f"System Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))