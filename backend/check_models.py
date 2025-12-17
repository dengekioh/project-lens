import google.generativeai as genai
import os
from dotenv import load_dotenv

# 1. 載入鑰匙
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("🔍 正在查詢您的 API Key 可用的模型清單...")
print("-" * 30)

try:
    # 列出所有模型
    for m in genai.list_models():
        # 我們只關心可以 "generateContent" (生成文字) 的模型
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ 發現模型: {m.name}")
            
except Exception as e:
    print(f"❌ 查詢失敗: {e}")