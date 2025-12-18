from pydantic import BaseModel

class ScrapeRequest(BaseModel):
    """
    Schema for the scrape request body.
    User sends a JSON with a 'url' field.
    """
    url: str