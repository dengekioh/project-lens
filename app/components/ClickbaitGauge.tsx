"use client";

interface Props {
  score: number; // 0 to 10
}

export default function ClickbaitGauge({ score }: Props) {
  // 計算指標位置 (0% 在底部, 100% 在頂部)
  const percentage = (score / 10) * 100;

  return (
    <div className="flex flex-col items-center h-full justify-end">
      {/* 更動 a: 移除了原本在這裡的 "Clickbait" 英文標題 div 
      */}

      <div className="relative h-32 w-6 rounded-full border border-gray-700 bg-gray-900 overflow-hidden">
        {/* 背景漸層：白色(0) -> 深紅(10) */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            background: "linear-gradient(to top, #ffffff 0%, #ffcccc 30%, #ff0000 70%, #8b0000 100%)"
          }}
        />

        {/* 指針 (一個黑色的橫條，隨著分數移動) */}
        <div
          className="absolute w-full h-1 bg-black border-y border-white/50 shadow-lg transition-all duration-1000 ease-out z-10"
          style={{
            bottom: `${percentage}%`,
            marginBottom: '-2px' // 修正指針置中
          }}
        />
      </div>

      {/* 分數顯示 */}
      <div className="mt-2 text-xl font-bold text-red-500">
        {score}
        <span className="text-xs text-gray-500 font-normal ml-0.5">/10</span>
      </div>
    </div>
  );
}