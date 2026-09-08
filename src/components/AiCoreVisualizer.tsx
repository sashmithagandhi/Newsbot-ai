import React from "react";
import { Sparkles, Radio } from "lucide-react";

interface AiCoreVisualizerProps {
  isProcessing?: boolean;
  stageText?: string;
  size?: "sm" | "md" | "lg";
}

export const AiCoreVisualizer: React.FC<AiCoreVisualizerProps> = ({
  isProcessing = false,
  stageText,
  size = "md",
}) => {
  const sizeMap = {
    sm: { container: "h-14 w-14", core: "h-7 w-7", ring1: "h-12 w-12", ring2: "h-14 w-14" },
    md: { container: "h-24 w-24", core: "h-12 w-12", ring1: "h-20 w-20", ring2: "h-24 w-24" },
    lg: { container: "h-36 w-36", core: "h-16 w-16", ring1: "h-28 w-28", ring2: "h-36 w-36" },
  };

  const dim = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {/* Animated Orb and Orbital Rings */}
      <div className={`relative flex items-center justify-center ${dim.container}`}>
        {/* Outer orbital ring */}
        <div
          className={`absolute rounded-full border border-dashed border-cyan-500/30 ${dim.ring2} ${
            isProcessing ? "animate-[spin_4s_linear_infinite]" : "opacity-40"
          }`}
        ></div>

        {/* Secondary reverse orbital ring */}
        <div
          className={`absolute rounded-full border border-cyan-400/20 ${dim.ring1} ${
            isProcessing ? "animate-[spin_7s_linear_infinite_reverse]" : "opacity-30"
          }`}
        ></div>

        {/* Ambient Glow */}
        <div
          className={`absolute rounded-full bg-cyan-500/20 blur-xl ${dim.core} ${
            isProcessing ? "animate-pulse" : "opacity-40"
          }`}
        ></div>

        {/* Core Glowing Orb */}
        <div
          className={`relative z-10 flex items-center justify-center rounded-full border border-cyan-300/40 bg-gradient-to-br from-cyan-400 via-sky-600 to-indigo-950 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] ${dim.core} ${
            isProcessing ? "scale-105" : "hover:scale-105 transition-transform"
          }`}
        >
          {isProcessing ? (
            <Radio className="h-5 w-5 animate-pulse text-white" />
          ) : (
            <Sparkles className="h-5 w-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          )}
        </div>
      </div>

      {/* Dynamic Processing Status Text */}
      {stageText && (
        <div className="flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-mono text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span>{stageText}</span>
        </div>
      )}
    </div>
  );
};
