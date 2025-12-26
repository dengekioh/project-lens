import asyncio
from newspaper import Article

async def fetch_article(url: str):
    """
    Asynchronously downloads and parses an article using newspaper3k.
    
    Args:
        url (str): The URL of the news article.
        
    Returns:
        Article: The parsed newspaper Article object.
    """
    
    # Define a synchronous helper function to run in a separate thread
    def _scrape_sync():
        article = Article(url)
        article.download()
        article.parse()
        return article

    # Run the blocking code in a thread pool to avoid blocking the main event loop
    return await asyncio.to_thread(_scrape_sync)