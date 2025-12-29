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
            
            # ============================================================
            # 【修改 1】更新 Yahoo 新聞的選擇器邏輯
            # 原因：
            # 1. Yahoo 已改版，不再使用 'caas-body' class
            # 2. 新版使用 <div class="atoms"> 容器
            # 3. 有多個 atoms 容器（第 1 個是圖片，第 2 個才是內文）
            # ============================================================
            if "yahoo.com" in url:
                print("DEBUG: 偵測到 Yahoo 新聞，啟動手動修正模式...")
                try:
                    # 使用 BeautifulSoup 解析 HTML
                    soup = BeautifulSoup(article.html, 'html.parser')
                    
                    # --------------------------------------------------------
                    # 【修改 2】改用 atoms 容器 + 迭代查找
                    # 原因：
                    # - Yahoo 有多個 <div class="atoms">
                    # - 第 1 個 atoms: 只有圖片 <figure>（空內容）
                    # - 第 2 個 atoms: 真正的文章段落 <p>
                    # - 需要迭代找到包含文字的那個
                    # --------------------------------------------------------
                    atoms_divs = soup.find_all('div', class_='atoms')
                    correct_text = ""
                    
                    for atoms in atoms_divs:
                        # 找這個 atoms 裡面的所有段落
                        paragraphs = atoms.find_all('p', class_='mb-module-gap')
                        
                        if paragraphs:
                            # ------------------------------------------------
                            # 【修改 3】過濾掉推薦連結和雜訊
                            # 原因：
                            # - 避免抓到「更多新聞報導」的連結段落
                            # - 避免抓到「原文出處」的來源標註
                            # - 確保只抓取真正的正文內容
                            # ------------------------------------------------
                            text_paragraphs = []
                            for p in paragraphs:
                                p_text = p.get_text(strip=True)
                                # 過濾掉推薦文章連結
                                if not p_text.startswith('更多') and not p_text.startswith('原文出處'):
                                    text_paragraphs.append(p_text)
                            
                            # 用雙換行連接段落，保持可讀性
                            correct_text = '\n\n'.join(text_paragraphs)
                            break  # 找到就停止，不繼續找下一個 atoms
                    
                    # --------------------------------------------------------
                    # 【修改 4】改用更精確的判斷條件
                    # 原因：改用 len() 判斷是否成功抓到內文
                    # --------------------------------------------------------
                    if correct_text:
                        # 覆寫回去
                        article.text = correct_text
                        print(f"DEBUG: Yahoo 內文修正成功！長度: {len(correct_text)} 字")
                    else:
                        print("DEBUG: 找不到 atoms 內文容器，維持原樣")
                        print(f"DEBUG: 找到 {len(atoms_divs)} 個 atoms 容器")
                except Exception as e:
                    print(f"DEBUG: Yahoo 解析修正失敗: {e}")
            # ============================================================
            
            # Debug Log
            print(f"DEBUG: 最終標題: {article.title}") 
            print(f"DEBUG: 最終內文前50字: {article.text[:50]}")
            
            return article
        except Exception as e:
            print(f"Scraping Error for {url}: {e}")
            raise e

    return await asyncio.to_thread(_scrape_sync)