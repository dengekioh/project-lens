"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useRef, useEffect, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  score: number;
}

export default function PoliticalGauge({ score }: Props) {
  const chartRef = useRef<any>(null);
  const [gradient, setGradient] = useState<CanvasGradient | string>("rgba(0,0,0,0)");

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    // 1. 建立圓錐漸層，起點設為 9 點鐘方向 (Math.PI)
    const gradientFill = ctx.createConicGradient(Math.PI, centerX, chartArea.bottom);

    // 2. 顏色斷點 (0.0 ~ 0.5 是上半圓可見區域)
    gradientFill.addColorStop(0, "#066020");      // -10 (起點: 綠)
    gradientFill.addColorStop(0.0375, "#066020");
    gradientFill.addColorStop(0.1, "#099030");
    gradientFill.addColorStop(0.175, "#3EC20A");
    gradientFill.addColorStop(0.225, "#55F316");
    
    gradientFill.addColorStop(0.25, "#FFFFFF");   // 0 (中點: 藍)
    
    gradientFill.addColorStop(0.3, "#6DE9D0");
    gradientFill.addColorStop(0.355, "#4710E0");
    gradientFill.addColorStop(0.4, "#4710E0");
    gradientFill.addColorStop(0.45, "#D817B5");
    gradientFill.addColorStop(0.48, "#BF121D");
    
    gradientFill.addColorStop(0.5, "#BF121D");    // 10 (終點: 紅)

    setGradient(gradientFill);
  }, []);

  const data = {
    labels: ["Political Spectrum"],
    datasets: [
      {
        data: [100],
        backgroundColor: gradient,
        borderColor: ["#111"],
        borderWidth: 0,
        circumference: 180,
        rotation: -90,
        cutout: "75%",
      },
    ],
  };

  const needleRotation = (score / 10) * 90;

  return (
    <div className="flex flex-col items-center justify-center mb-8">
      <div className="relative w-64 h-32">
        <Doughnut
          ref={chartRef}
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { bottom: 0 } },
            plugins: {
              legend: { display: false },
              tooltip: { enabled: false },
            },
            events: [],
            animation: { animateScale: true, animateRotate: true }
          }}
        />

        <div
          className="absolute bottom-0 left-1/2 w-1.5 h-24 bg-white origin-bottom transition-transform duration-1000 ease-out z-20 rounded-t-full drop-shadow-md"
          style={{
            transform: `translateX(-50%) rotate(${needleRotation}deg)`,
            boxShadow: "0 0 4px rgba(0,0,0,0.5)"
          }}
        />

        <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full transform -translate-x-1/2 translate-y-1/2 z-30 shadow-md border-2 border-gray-900" />
      </div>

      <div className="text-center mt-6">
        <div className="text-5xl font-bold text-white tracking-tighter drop-shadow-lg"
             style={{ color: score === 0 ? '#B8E7FF' : 'white' }}>
          {score > 0 ? `+${score}` : score}
        </div>
        {/* 更動 a: 移除了原本在這裡的 "Political Score" 英文標題 p tag 
        */}
      </div>
    </div>
  );
}