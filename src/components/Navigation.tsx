import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Newspaper,
  Compass,
  GitCompare,
  Archive,
  BarChart3,
  Briefcase,
  Bell,
  User,
  MessageSquarePlus,
  RefreshCw,
  Menu,
  PanelLeft,
  X,
  Radio,
  Clock
} from "lucide-react";
import { UserProfile } from "../types";

export type NavTab = "home" | "news" | "ai" | "compare" | "archive" | "analytics" | "agencies";

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenRegister: () => void;
  onOpenFeedback: () => void;
  onTriggerFetchNow: () => void;
  isFetchingNow: boolean;
  user: UserProfile | null;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount,
  onOpenAlerts,
  onOpenRegister,
  onOpenFeedback,
  onTriggerFetchNow,
  isFetchingNow,
  user,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const [istTime, setIstTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        day: "2-digit",
        month: "short"
      };
      setIstTime(new Intl.DateTimeFormat("en-IN", options).format(now));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const tabLabels: Record<NavTab, { title: string; subtitle: string }> = {
    home: { title: "Front Page", subtitle: "Editorial wire & breaking lead stories" },
    news: { title: "Explore Dispatches", subtitle: "Cross-broadsheet news stream" },
    ai: { title: "AI NewsBot", subtitle: "Grounded intelligence terminal" },
    compare: { title: "Cross-Paper Comparison", subtitle: "Multi-editorial consensus & angles" },
    archive: { title: "Historical Archive", subtitle: "Deep search indexed editions" },
    analytics: { title: "Command Telemetry", subtitle: "Newsroom metrics & ingestion telemetry" },
    agencies: { title: "Media Agency Marketplace", subtitle: "Accredited print & ad inventory" },
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.08] bg-[#070a0f]/90 backdrop-blur-xl transition-all">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Side: Sidebar Toggle & Section Title */}
        <div className="flex items-center space-x-3.5">
          <button
            id="global-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className="flex items-center space-x-2 rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition shadow-[0_0_15px_rgba(6,182,212,0.15)] focus:outline-none"
            title={isSidebarOpen ? "Close Navigation Sidebar" : "Open Navigation Sidebar"}
          >
            <Menu className="h-4 w-4 text-cyan-400" />
            <span className="hidden sm:inline">Sidebar</span>
          </button>

          <div className="h-5 w-[1px] bg-white/[0.1] hidden sm:block"></div>

          {/* Breadcrumb / Active Tab Title */}
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-100 font-['Cinzel'] tracking-wide">
                {tabLabels[activeTab]?.title || "NewsBot"}
              </h1>
              <span className="hidden md:inline-block rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-white/[0.05]">
                {tabLabels[activeTab]?.subtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Telemetry, Fetch, Alerts, User */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Live IST Status Chip */}
          <div className="hidden lg:flex items-center space-x-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[11px] font-mono text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>IST: {istTime || "LIVE"}</span>
          </div>

          {/* Quick AI Jump if not on AI tab */}
          {activeTab !== "ai" && (
            <button
              onClick={() => setActiveTab("ai")}
              className="hidden sm:flex items-center space-x-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition"
              title="Open AI Research Terminal"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Ask NewsBot</span>
            </button>
          )}

          {/* Fetch Wire Button */}
          <button
            onClick={onTriggerFetchNow}
            disabled={isFetchingNow}
            className="flex items-center space-x-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-2.5 sm:px-3 py-1.5 text-xs font-mono font-medium text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400 transition disabled:opacity-50"
            title="Fetch latest newspaper dispatches"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetchingNow ? "animate-spin text-cyan-300" : "text-cyan-400"}`} />
            <span className="hidden md:inline">{isFetchingNow ? "Syncing..." : "Sync Wire"}</span>
          </button>

          {/* Alerts Bell */}
          <button
            onClick={onOpenAlerts}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-300 transition hover:border-cyan-500/30 hover:bg-cyan-950/30 hover:text-cyan-300 focus:outline-none"
            aria-label="Open Alerts"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500 px-1 font-mono text-[9px] font-bold text-black shadow-[0_0_8px_#06b6d4]">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* User Profile Trigger */}
          <button
            onClick={onOpenRegister}
            className="flex items-center space-x-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-slate-300 hover:border-white/[0.2] transition"
            title="Reader Profile & Preferences"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-slate-700 text-[10px] font-bold text-white">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "SG"}
            </div>
            <span className="hidden md:inline font-medium text-slate-200">
              {user?.name ? user.name.split(" ")[0] : "Reader"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

