"use client";

interface Props {
  score: number; // -10 to 10
}

export default function EntityAlignmentBar({ score }: Props) {
  // 將 -10~10 轉換為 0%~100% 的位置
  const percentage = ((score + 10) / 20) * 100;

  return (
    <div className="w-full max-w-[200px] h-4 bg-gray-800 rounded-full relative border border-gray-600 overflow-hidden">
      {/* 背景漸層：深紫色(-10) -> 白色(0) -> 黃色(10) */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: "linear-gradient(to right, #4c1d95 0%, #ffffff 50%, #facc15 100%)"
        }}
      />
      
      {/* 指針標記 */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-black border-x border-white/50 shadow-md"
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
}