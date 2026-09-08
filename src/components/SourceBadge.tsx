import React from "react";

interface SourceBadgeProps {
  source: string;
  size?: "sm" | "md";
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, size = "md" }) => {
  const getBadgeConfig = (s: string) => {
    const lower = s.toLowerCase();
    if (lower.includes("hindu")) {
      return {
        label: "THE HINDU",
        bg: "bg-sky-500/10",
        border: "border-sky-500/30",
        text: "text-sky-400",
        dot: "bg-sky-400"
      };
    }
    if (lower.includes("times of india") || lower.includes("toi")) {
      return {
        label: "TIMES OF INDIA",
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        text: "text-rose-400",
        dot: "bg-rose-400"
      };
    }
    if (lower.includes("indian express") || lower.includes("express")) {
      return {
        label: "INDIAN EXPRESS",
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-400",
        dot: "bg-amber-400"
      };
    }
    if (lower.includes("ndtv")) {
      return {
        label: "NDTV WIRE",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        dot: "bg-emerald-400"
      };
    }
    return {
      label: s.toUpperCase(),
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      text: "text-purple-400",
      dot: "bg-purple-400"
    };
  };

  const config = getBadgeConfig(source);
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded font-mono font-semibold tracking-wider uppercase border ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${config.dot}`}></span>
      <span>{config.label}</span>
    </span>
  );
};
