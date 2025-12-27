import asyncio
import os
from newspaper import Article, Config
from bs4 import BeautifulSoup

async def fetch_article(url: str):
    
    def _scrape_sync():
        # 1. 準備更完整的偽裝 headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            # 關鍵！告訴 Yahoo 我是從 Google 來的，不要擋我
            'Referer': 'https://www.google.com/',
        }

        config = Config()
        # newspaper3k 的 config 支援直接設定 headers
        config.headers = headers
        config.request_timeout = 15

        article = Article(url, config=config)
        
        try:
            article.download()
            # -----------------------------------------------------------
            # 🛑 DEBUG STEP 1: 在 Parse 之前，先存檔 HTML 看看
            # -----------------------------------------------------------
            # 這樣我們就知道：到底是「沒下載到內文」，還是「下載到了但 Parse 錯」
            #debug_filename = "debug_yahoo.html"
            #with open(debug_filename, "w", encoding="utf-8") as f:
            #    f.write(article.html)
            #print(f"DEBUG: 原始 HTML 已存檔至 {os.path.abspath(debug_filename)}")
            # -----------------------------------------------------------
            article.parse()
            
            # -----------------------------------------------------------
            # 🎯 Yahoo 專用修正補丁 (Sniper Mode)
            # -----------------------------------------------------------
            if "yahoo.com" in url:
                print("DEBUG: 偵測到 Yahoo 新聞，啟動手動修正模式...")
                try:
                    # 使用 BeautifulSoup 解析 HTML
                    soup = BeautifulSoup(article.html, 'html.parser')
                    
                    # Yahoo 的內文通常藏在 'caas-body' 這個 class 裡面
                    content_div = soup.find('div', class_='caas-body')
                    
                    if content_div:
                        # 重新抓取乾淨的文字，覆蓋掉 newspaper3k 抓錯的內容
                        # strip=True 去除前後空白, separator='\n' 保留換行
                        correct_text = content_div.get_text(separator='\n', strip=True)
                        
                        # 覆寫回去
                        article.text = correct_text
                        print(f"DEBUG: Yahoo 內文修正成功！長度: {len(correct_text)} 字")
                    else:
                        print("DEBUG: 找不到 caas-body，維持原樣")
                except Exception as e:
                    print(f"DEBUG: Yahoo 解析修正失敗: {e}")
            # -----------------------------------------------------------
            
            # Debug Log
            print(f"DEBUG: 最終標題: {article.title}") 
            print(f"DEBUG: 最終內文前50字: {article.text[:50]}")
            
            return article
        except Exception as e:
            print(f"Scraping Error for {url}: {e}")
            raise e

    return await asyncio.to_thread(_scrape_sync)