import asyncio
from newspaper import Article, Config  

async def fetch_article(url: str):
    """
    Asynchronously downloads and parses an article using newspaper3k.
    With User-Agent spoofing to bypass 403 Forbidden errors.
    """
    
    # 定義一個同步的 Helper function
    def _scrape_sync():
        # 2. 設定偽裝資訊 
        user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        
        config = Config()
        config.browser_user_agent = user_agent
        config.request_timeout = 10 # 設定超時避免卡太久

        # 3. 把 config 塞進 Article 裡
        article = Article(url, config=config)
        
        try:
            article.download()
            article.parse()
            return article
        except Exception as e:
            # 簡單的錯誤處理，印出來方便除錯
            print(f"Scraping Error for {url}: {e}")
            raise e

    # 丟到執行緒去跑
    return await asyncio.to_thread(_scrape_sync)