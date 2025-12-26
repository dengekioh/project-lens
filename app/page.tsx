"use client";

import { useState } from "react";
import PoliticalGauge from "./components/PoliticalGauge";
import ClickbaitGauge from "./components/ClickbaitGauge";
import EntityAlignmentBar from "./components/EntityAlignmentBar";
import InfoModal from "./components/InfoModal";

// ---------------------------------------------------------
// 設定：切換資料來源
// ---------------------------------------------------------
const USE_MOCK_DATA = false; 

// ---------------------------------------------------------
// 定義資料結構 (依照新 API 格式修正)
// ---------------------------------------------------------
interface EntityAnalysis {
  name: string;
  alignment_score: number;
  author_stance: string;
  analysis: string;
}

// 新增: 核心分析資料介面 (原本的最外層現在變成內層)
interface CoreAnalysisData {
  meta: {
    is_political: boolean;
    political_spectrum_score: number;
    political_leaning_label: string;
    clickbait_score: number;
    clickbait_verdict: string;
  };
  narrative_mode: {
    is_heavy_quoting: boolean;
    primary_quoted_voice: string;
    author_voice_presence: string;
    cognitive_tactic: string;
  };
  entity_analysis: EntityAnalysis[];
  insider_critique: {
    summary: string;
    commentary: string;
  };
}

// 更新: 最外層 API 回傳結構 (包含 title, content, analysis)
interface AnalysisResult {
  title: string;
  content: string;
  url: string;
  analysis: CoreAnalysisData;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPoliticalInfo, setShowPoliticalInfo] = useState(false);
  const [showEntityInfo, setShowEntityInfo] = useState(false);

  const handleAnalyze = async () => {
    // 0. 基礎防呆
    // Mock 模式下允許空字串直接測試
    if (!USE_MOCK_DATA && !url.trim()) return;

    // a. 網址格式確認
    if (!USE_MOCK_DATA) {
        try {
          new URL(url); 
        } catch (_) {
          setError("非網址格式");
          setResult(null);
          return;
        }
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      let data;

      if (USE_MOCK_DATA) {
        console.log("Mode: Local Mock Data");
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockData = await import("./resp.json");
        data = JSON.parse(JSON.stringify(mockData));

      } else {
        console.log("Mode: Real API Request via Proxy");
        const response = await fetch('/api/proxy/scrape', { 
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: url })
        });

        if (!response.ok) {
           let errorMsg = `API Error: ${response.status}`;
           try {
              const errorJson = await response.json();
              // 嘗試抓取各種可能的錯誤欄位
              if (errorJson.detail) errorMsg += ` - ${JSON.stringify(errorJson.detail)}`;
              else errorMsg += ` - ${JSON.stringify(errorJson)}`;
           } catch (_) {
              const errorText = await response.text();
              if (errorText) errorMsg += ` - ${errorText.slice(0, 100)}...`;
           }
           throw new Error(errorMsg);
        }

        data = await response.json();
      }

      setResult(data as AnalysisResult);

    } catch (err) {
      console.error(err);
      setError(USE_MOCK_DATA 
        ? "讀取 resp.json 失敗，請確認檔案是否存在。" 
        : `分析失敗: ${err instanceof Error ? err.message : "請確認後端是否喚醒"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-3xl space-y-8 pb-12">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter text-blue-500">
            Project Lens <span className="text-sm text-gray-500">v1.2</span>
          </h1>
          <p className="text-gray-400">透視新聞背後的偏見光譜</p>
        </div>

        {/* Input Section */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="在此貼上新聞連結..."
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
            {isLoading ? "AI 大腦運轉中..." : "開始分析"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-900/50 text-red-200 rounded-lg border border-red-800 break-words">
            ⚠️ {error}
          </div>
        )}

        {/* Result Visualization */}
        {result && (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 animation-fade-in space-y-8">
            
            {/* 新增: 顯示新聞標題 (確認有抓對文章) */}
            <div className="border-b border-gray-800 pb-4 mb-4">
                <h2 className="text-xl font-bold text-gray-200 leading-snug">
                    📄 {result.title}
                </h2>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mt-1 block">
                    開啟原始網頁 ↗
                </a>
            </div>

            {/* 修改: 路徑皆需多一層 .analysis */}
            {!result.analysis.meta.is_political ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl">🧘</div>
                <h2 className="text-2xl font-bold text-green-400">非政治性內容</h2>
                <p className="text-gray-400 max-w-md mx-auto">
                  系統偵測到這篇文章與政治立場無關。
                </p>
                <div className="mt-6 p-4 bg-black/30 rounded text-left">
                    <p className="text-gray-300">{result.analysis.insider_critique.summary}</p>
                </div>
              </div>
            ) : (
              <>
                {/* --- 1. 雙光譜區 --- */}
                <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center">
                  
                  {/* 左邊：政治光譜 */}
                  <div className="flex-1 w-full flex flex-col items-center justify-between">
                    <div className="flex flex-col items-center w-full">
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-lg font-bold text-blue-300">政治立場解析</h3>
                          <button onClick={() => setShowPoliticalInfo(true)} className="text-gray-500 hover:text-white transition">
                              ⓘ
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <PoliticalGauge score={result.analysis.meta.political_spectrum_score} />
                        </div>
                    </div>

                    <span className="px-4 py-1.5 bg-blue-900/30 text-blue-300 border border-blue-800 rounded-full text-sm font-medium">
                      #{result.analysis.meta.political_leaning_label}
                    </span>
                  </div>

                  {/* 右邊：標題黨光譜 */}
                  <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center justify-between">
                     <div className="flex flex-col items-center w-full">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-bold text-red-300">標題聳動指數</h3>
                        </div>

                        <div className="mb-4 flex justify-center">
                            <ClickbaitGauge score={result.analysis.meta.clickbait_score} />
                        </div>
                     </div>

                    <span className={`px-4 py-1.5 border rounded-full text-sm font-medium ${
                      result.analysis.meta.clickbait_score > 5 
                        ? "bg-red-900/30 text-red-300 border-red-800" 
                        : "bg-green-900/30 text-green-300 border-green-800"
                    }`}>
                      #{result.analysis.meta.clickbait_verdict}
                    </span>
                  </div>
                </div>

                {/* --- 2. 摘要與評論 --- */}
                <div className="bg-black/40 rounded-lg p-6 space-y-5 border border-gray-800/50">
                  <div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      內容摘要
                    </h3>
                    <p className="text-lg leading-relaxed text-gray-200">
                      {result.analysis.insider_critique.summary}
                    </p>
                  </div>
                  <div className="h-px bg-gray-800 w-full"></div>
                  <div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      AI 毒舌評論
                    </h3>
                    <div className="flex gap-4 items-start">
                      <span className="text-3xl">🤖</span>
                      <p className="text-gray-300 text-sm italic border-l-2 border-red-500 pl-4 py-1">
                        {result.analysis.insider_critique.commentary}
                      </p>
                    </div>
                  </div>

                  {result.analysis.narrative_mode.cognitive_tactic !== "無" && (
                     <div className="pt-2">
                       <span className="px-4 py-1.5 bg-purple-900/30 text-purple-300 border border-purple-800 rounded-full text-sm font-medium">
                         ⚠️ 文章戰術偵測: {result.analysis.narrative_mode.cognitive_tactic}
                       </span>
                     </div>
                  )}
                </div>

                {/* --- 3. 人物立場定調分析 --- */}
                <div className="pt-6 border-t border-gray-800">
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-xl font-bold text-white">新聞人物立場定調</h3>
                    <button onClick={() => setShowEntityInfo(true)} className="text-gray-500 hover:text-white transition">
                        ⓘ
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {result.analysis.entity_analysis.map((entity, index) => (
                      <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 flex flex-col gap-3">
                        
                        {/* 第一行：對象、光譜、標籤 */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                            <div className="w-full sm:w-32 font-bold text-lg text-white text-center sm:text-left">
                            {entity.name}
                            </div>
                            <div className="flex-1 w-full flex flex-col items-center">
                            <EntityAlignmentBar score={entity.alignment_score} />
                            <div className="flex justify-between w-full max-w-[200px] text-[10px] text-gray-500 mt-1 font-mono">
                                <span>毀滅(-10)</span>
                                <span>造神(+10)</span>
                            </div>
                            </div>
                            <div className="w-full sm:w-auto text-center">
                            <span className={`px-3 py-1 rounded text-sm font-bold border ${
                                entity.alignment_score < -3 ? "text-purple-300 border-purple-800 bg-purple-900/20" :
                                entity.alignment_score > 3 ? "text-yellow-300 border-yellow-800 bg-yellow-900/20" :
                                "text-gray-300 border-gray-600 bg-gray-700/20"
                            }`}>
                                {entity.author_stance}
                            </span>
                            </div>
                        </div>

                        {/* 第二行：Analysis 內容 */}
                        <div className="w-full text-sm text-gray-400 bg-black/20 p-3 rounded border-l-2 border-gray-600 text-left">
                            {entity.analysis}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* --- Modals (維持不變) --- */}
      <InfoModal isOpen={showPoliticalInfo} onClose={() => setShowPoliticalInfo(false)} title="政治光譜分數定義">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="p-2">分數</th>
              <th className="p-2">核心標籤</th>
              <th className="p-2 hidden md:table-cell">觀點詮釋</th>
              <th className="p-2 hidden md:table-cell">典型關鍵詞</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            <tr>
              <td className="p-2 text-[#4BA069] font-bold">-10</td>
              <td className="p-2 font-bold">極度台獨 / 解構中華</td>
              <td className="p-2 hidden md:table-cell">徹底否認中華民國體制，追求法理建國。</td>
              <td className="p-2 hidden md:table-cell text-xs">支那、流亡政府、脫脂</td>
            </tr>
            <tr>
              <td className="p-2 text-[#6AB986] font-bold">-9 ~ -8</td>
              <td className="p-2 font-bold">激進獨派 / 深綠</td>
              <td className="p-2 hidden md:table-cell">強烈台灣民族主義，視國民黨為殖民遺毒。</td>
              <td className="p-2 hidden md:table-cell text-xs">抗中保台、賣台賊</td>
            </tr>
            <tr>
              <td className="p-2 text-[#8FCBA4] font-bold">-7 ~ -5</td>
              <td className="p-2 font-bold">主流綠營 / 抗中立場</td>
              <td className="p-2 hidden md:table-cell">強調「中華民國台灣」，反對九二共識。</td>
              <td className="p-2 hidden md:table-cell text-xs">民主防衛、互不隸屬</td>
            </tr>
            <tr>
              <td className="p-2 text-[#D5ECDD] font-bold">-4 ~ -2</td>
              <td className="p-2 font-bold">理性防中 / 西方盟友</td>
              <td className="p-2 hidden md:table-cell">基於自由價值排斥中國，第一島鏈視角。</td>
              <td className="p-2 hidden md:table-cell text-xs">去風險化、印太戰略</td>
            </tr>
            <tr>
              <td className="p-2 text-[#EDF7F1] font-bold">-1</td>
              <td className="p-2 font-bold">微幅疑中 / 現狀派</td>
              <td className="p-2 hidden md:table-cell">對中國保持距離，但不願激怒對方。</td>
              <td className="p-2 hidden md:table-cell text-xs">維持現狀、避戰</td>
            </tr>
            <tr>
              <td className="p-2 text-[#B8E7FF] font-bold">0</td>
              <td className="p-2 font-bold">絕對中立</td>
              <td className="p-2 hidden md:table-cell">無情感色彩，純粹紀錄。</td>
              <td className="p-2 hidden md:table-cell text-xs">兩岸、雙方</td>
            </tr>
            <tr>
              <td className="p-2 text-[#B8E7FF] font-bold">+1</td>
              <td className="p-2 font-bold">務實交流 / 商業優先</td>
              <td className="p-2 hidden md:table-cell">政治放一邊，賺錢優先。</td>
              <td className="p-2 hidden md:table-cell text-xs">兩岸紅利、經貿往來</td>
            </tr>
            <tr>
              <td className="p-2 text-[#61C5FF] font-bold">+2 ~ +4</td>
              <td className="p-2 font-bold">疑美論 / 輕度親中</td>
              <td className="p-2 hidden md:table-cell">批判「倚美謀獨」，主張對中避險。</td>
              <td className="p-2 hidden md:table-cell text-xs">棋子、要和平不要戰爭</td>
            </tr>
            <tr>
              <td className="p-2 text-[#2B05FF] font-bold">+5 ~ +7</td>
              <td className="p-2 font-bold">主流藍營 / 中華文化</td>
              <td className="p-2 hidden md:table-cell">強調九二共識、反台獨、同文同種。</td>
              <td className="p-2 hidden md:table-cell text-xs">兩岸一家親、數典忘祖</td>
            </tr>
            <tr>
              <td className="p-2 text-[#FD08C7] font-bold">+8 ~ +9</td>
              <td className="p-2 font-bold">和平統一 / 紅色宣傳</td>
              <td className="p-2 hidden md:table-cell">讚揚中國成就，唱衰台灣。</td>
              <td className="p-2 hidden md:table-cell text-xs">祖國強大、一國兩制</td>
            </tr>
            <tr>
              <td className="p-2 text-[#FF0705] font-bold">+10</td>
              <td className="p-2 font-bold">武統意圖 / 敵對入侵</td>
              <td className="p-2 hidden md:table-cell">無視台灣主權，正當化武力行為。</td>
              <td className="p-2 hidden md:table-cell text-xs">留島不留人、武力解放</td>
            </tr>
          </tbody>
        </table>
      </InfoModal>

      <InfoModal isOpen={showEntityInfo} onClose={() => setShowEntityInfo(false)} title="人物定調光譜定義 (敘事角色)">
        <table className="w-full border-collapse text-left">
            <thead>
                <tr className="border-b border-gray-700 text-gray-400">
                    <th className="p-2">分數</th>
                    <th className="p-2">敘事角色</th>
                    <th className="p-2 hidden md:table-cell">認知意圖</th>
                    <th className="p-2 hidden md:table-cell">範例</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
                <tr>
                    <td className="p-2 text-purple-400 font-bold">-10</td>
                    <td className="p-2 font-bold">大反派 (妖魔化)</td>
                    <td className="p-2 hidden md:table-cell">非理性攻擊，煽動仇恨。</td>
                    <td className="p-2 hidden md:table-cell text-xs">賣國賊、邪惡軸心</td>
                </tr>
                <tr>
                    <td className="p-2 text-purple-400 font-bold">-9 ~ -7</td>
                    <td className="p-2 font-bold">麻煩製造者 (標靶)</td>
                    <td className="p-2 hidden md:table-cell">無限放大錯誤，獵巫。</td>
                    <td className="p-2 hidden md:table-cell text-xs">毫無悔意、又出包</td>
                </tr>
                <tr>
                    <td className="p-2 text-purple-300 font-bold">-6 ~ -4</td>
                    <td className="p-2 font-bold">被質疑者 (負面框架)</td>
                    <td className="p-2 hidden md:table-cell">單向引用批評，暗示動機不純。</td>
                    <td className="p-2 hidden md:table-cell text-xs">外界質疑、恐涉嫌</td>
                </tr>
                <tr>
                    <td className="p-2 text-purple-200 font-bold">-3 ~ -2</td>
                    <td className="p-2 font-bold">局外人 (冷淡)</td>
                    <td className="p-2 hidden md:table-cell">剝奪能動性，生硬稱呼。</td>
                    <td className="p-2 hidden md:table-cell text-xs">聲稱、據傳</td>
                </tr>
                <tr>
                    <td className="p-2 text-gray-300 font-bold">-1 ~ +1</td>
                    <td className="p-2 font-bold">新聞當事人 (中立)</td>
                    <td className="p-2 hidden md:table-cell">去情緒化，等距報導。</td>
                    <td className="p-2 hidden md:table-cell text-xs">表示、指出</td>
                </tr>
                <tr>
                    <td className="p-2 text-yellow-100 font-bold">+2 ~ +3</td>
                    <td className="p-2 font-bold">受訪嘉賓 (友善)</td>
                    <td className="p-2 hidden md:table-cell">完整引用論述，優先報導其解釋。</td><td className="p-2 hidden md:table-cell text-xs">強調、語重心長</td>
                </tr>
                <tr>
                    <td className="p-2 text-yellow-300 font-bold">+4 ~ +6</td>
                    <td className="p-2 font-bold">建設者 (盟友)</td>
                    <td className="p-2 hidden md:table-cell">放大政績，縮小失誤。敵人的敵人。</td>
                    <td className="p-2 hidden md:table-cell text-xs">一針見血、獲好評</td>
                </tr>
                <tr>
                    <td className="p-2 text-yellow-400 font-bold">+7 ~ +9</td>
                    <td className="p-2 font-bold">英雄/領袖 (護航)</td>
                    <td className="p-2 hidden md:table-cell">主動辯護，使用高強度正面形容詞。</td>
                    <td className="p-2 hidden md:table-cell text-xs">霸氣、不畏強權</td>
                </tr>
                <tr>
                    <td className="p-2 text-yellow-500 font-bold">+10</td>
                    <td className="p-2 font-bold">救世主 (造神)</td>
                    <td className="p-2 hidden md:table-cell">神格化，情感動員。</td>
                    <td className="p-2 hidden md:table-cell text-xs">偉大、歷史時刻</td>
                </tr>
            </tbody>
        </table>
      </InfoModal>

    </main>
  );
}