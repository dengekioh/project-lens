from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from newspaper import Article

# 1. Initialize the FastAPI application
# This 'app' instance will handle all incoming requests.
app = FastAPI()

# 2. Define the Data Model (Schema)
# We use Pydantic to validate the input data.
# This ensures that the request body MUST contain a 'url' field which is a string.
class ScrapeRequest(BaseModel):
    url: str

# 3. Root Endpoint (Health Check)
# A simple GET request to verify if the server is running correctly.
# Access this at: http://127.0.0.1:8000/
@app.get("/")
def read_root():
    return {"message": "Hello, Project Lens Backend is alive!"}

# 4. Scraper Endpoint
# This is the core logic. It accepts a POST request with a URL.
# Access this at: http://127.0.0.1:8000/scrape
@app.post("/scrape")
def scrape_article(request: ScrapeRequest):
    try:
        # Log the URL to the console for debugging purposes
        print(f"Processing URL: {request.url}")

        # --- Scraping Logic using newspaper3k ---
        
        # Step A: Create an Article object with the provided URL
        article = Article(request.url)
        
        # Step B: Download the raw HTML content from the website
        article.download()
        
        # Step C: Parse the HTML to extract meaningful data (title, text, authors, etc.)
        article.parse()
        
        # --- Validation ---
        
        # Check if the title was successfully extracted. 
        # If not, the scraping likely failed or the site blocked us.
        if not article.title:
            return {"error": "Failed to retrieve title. The URL might be invalid or protected."}

        # --- Response ---
        
        # Return the clean data as a JSON object
        return {
            "title": article.title,
            # We only return the first 200 characters for now to keep the response concise during testing
            "content": article.text[:200] + "...", 
            "url": request.url
        }
        
    except Exception as e:
        # --- Error Handling ---
        
        # If anything crashes (e.g., network error, invalid URL format), 
        # catch the exception and return a 500 Internal Server Error with details.
        print(f"Error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))