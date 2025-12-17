import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from newspaper import Article
from dotenv import load_dotenv
import google.generativeai as genai

# --- 1. 環境設定 ---
# 載入 .env 裡的 API Key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# 設定 Google Gemini
# 注意：如果之後要上線，記得加個檢查，沒有 Key 就報錯
if api_key:
    genai.configure(api_key=api_key)
    # 使用我們剛剛測試成功的最新模型
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None
    print("⚠️ 警告: 找不到 GEMINI_API_KEY，AI 功能將無法使用")

# 初始化 FastAPI
app = FastAPI()

class ScrapeRequest(BaseModel):
    url: str

# --- 2. 輔助函式：呼叫 AI ---
def analyze_article_with_ai(content):
    if not model:
        return {"error": "AI not configured"}
    
    # 這是給 AI 的指令 (Prompt)
    # 我們要求它只回傳純 JSON，不要廢話
    prompt = f"""
    請閱讀以下新聞內容，並進行分析。
    請嚴格遵守回傳格式，僅回傳一個 JSON 物件，不要有 markdown 標記或其他文字。
    
    JSON 格式要求：
    {{
        "summary": "用台灣繁體中文寫出的30字內摘要，語氣要像資深鄉民一樣犀利",
        "sentiment_score": 一個整數，範圍 -10 (超悲觀/憤怒) 到 10 (超樂觀/開心),
        "tags": ["標籤1", "標籤2", "標籤3"]
    }}

    新聞內容：
    {content[:2000]} 
    (為了節省 Token，我們只截取前 2000 字)
    """

    try:
        response = model.generate_content(prompt)
        # 清洗資料：有時候 AI 會雞婆加上 ```json ... ```，我們要把它洗掉
        clean_text = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(clean_text)
    except Exception as e:
        print(f"AI 分析失敗: {e}")
        # 萬一 AI 壞了，回傳一個安全版本，不要讓程式當機
        return {
            "summary": "AI 暫時無法分析這篇文章",
            "sentiment_score": 0,
            "tags": ["Error"]
        }

# --- 3. 主 API ---
@app.get("/")
def read_root():
    return {"message": "Project Lens Backend V2 (AI Enabled)"}

@app.post("/scrape")
def scrape_article(request: ScrapeRequest):
    try:
        print(f"正在處理: {request.url}")
        
        # Step 1: 爬蟲
        article = Article(request.url)
        article.download()
        article.parse()
        
        if not article.title:
            return {"error": "無法抓取標題"}

        # Step 2: 呼叫 AI 分析 (這是新增的步驟)
        print("🤖 正在呼叫 Gemini 進行分析...")
        ai_result = analyze_article_with_ai(article.text)

        # Step 3: 合併結果並回傳
        return {
            "title": article.title,
            "content": article.text[:200] + "...", # 預覽就好
            "url": request.url,
            # 把 AI 的分析結果展開放在這裡
            "ai_summary": ai_result.get("summary"),
            "sentiment": ai_result.get("sentiment_score"),
            "tags": ai_result.get("tags")
        }
        
    except Exception as e:
        print(f"系統錯誤: {e}")
        raise HTTPException(status_code=500, detail=str(e))