"use client"; // 這行非常重要，代表這是前端元件

import { useState } from "react";

export default function Home() {
  // 這裡用來存使用者輸入的網址
  const [url, setUrl] = useState("");
  // 這裡用來存 "模擬" 的 API 回傳結果
  const [result, setResult] = useState<string | null>(null);
  // 這裡用來控制是否正在讀取中 (Loading)
  const [isLoading, setIsLoading] = useState(false);

  // 當按下按鈕時會執行的動作
  const handleAnalyze = async () => {
    if (!url) {
      alert("拜託貼個網址好嗎？");
      return;
    }

    setIsLoading(true);
    setResult(null); // 清空上次結果

    // 模擬：假裝我們正在呼叫 A 君的 API (等待 1.5 秒)
    console.log("正在傳送網址給後端:", url);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 模擬：這是我們預期 A 君會回傳的 JSON 格式
    const mockResponse = {
      status: "success",
      data: {
        score: -5,
        summary: "這篇文章明顯偏向特定政治立場，使用了大量情緒化字眼。",
        bias_tags: ["情緒勒索", "缺乏數據", "左派觀點"],
        reasoning: "文中多次使用『慘絕人寰』形容政策，卻未提出具體受害數據。",
      },
    };

    // 把結果顯示出來
    setResult(JSON.stringify(mockResponse, null, 2));
    setIsLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* 標題區 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter text-blue-500">
            Project Lens <span className="text-sm text-gray-500">v0.1</span>
          </h1>
          <p className="text-gray-400">透視新聞背後的偏見光譜</p>
        </div>

        {/* 輸入區 */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="在此貼上新聞連結 (URL)..."
            className="w-full p-4 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-blue-500 transition"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className={`w-full p-4 rounded-lg font-bold text-lg transition ${
              isLoading
                ? "bg-gray-700 cursor-not-allowed text-gray-400"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isLoading ? "AI 分析中..." : "開始透鏡分析"}
          </button>
        </div>

        {/* 結果顯示區 (Console 風格) */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 font-mono text-sm min-h-[200px] overflow-auto">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2 mb-4 text-gray-500">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="ml-2">System Output</span>
          </div>
          
          {result ? (
            <pre className="text-green-400 whitespace-pre-wrap">{result}</pre>
          ) : (
            <div className="text-gray-600">
              {isLoading ? "Connecting to neural network..." : "> Waiting for input..."}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}