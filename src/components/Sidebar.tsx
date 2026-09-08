import React from "react";
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
  MessageSquare,
  RefreshCw,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
  Radio,
  ExternalLink,
  Layers,
  Flame,
  Clock
} from "lucide-react";
import { NavTab } from "./Navigation";
import { SourceMeta, UserProfile } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  newspapers: SourceMeta[];
  selectedSource: string;
  onSelectSource: (source: string) => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenRegister: () => void;
  onOpenFeedback: () => void;
  onTriggerFetchNow: () => void;
  isFetchingNow: boolean;
  user: UserProfile | null;
  articlesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onSelectTab,
  newspapers,
  selectedSource,
  onSelectSource,
  unreadAlertsCount,
  onOpenAlerts,
  onOpenRegister,
  onOpenFeedback,
  onTriggerFetchNow,
  isFetchingNow,
  user,
  articlesCount,
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: "home", label: "Front Page", description: "Lead stories & curated wire", icon: Newspaper },
    { id: "news", label: "Explore Dispatches", description: "Filter & search all papers", icon: Compass },
    { id: "ai", label: "AI NewsBot Terminal", description: "Grounded neural Q&A", icon: Sparkles, badge: "Gemini" },
    { id: "compare", label: "Cross-Paper Compare", description: "Side-by-side editorial matrix", icon: GitCompare },
    { id: "archive", label: "Intelligence Archive", description: "Search historical editions", icon: Archive },
    { id: "analytics", label: "Command Telemetry", description: "Ingestion & sentiment stats", icon: BarChart3 },
    { id: "agencies", label: "Agency Marketplace", description: "Accredited print media", icon: Briefcase },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-label="Close sidebar backdrop"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-white/[0.08] bg-[#090d14] text-slate-200 transition-all duration-300 ease-in-out ${
          isOpen
            ? "w-72 translate-x-0 shadow-[4px_0_30px_rgba(0,0,0,0.6)]"
            : "-translate-x-full lg:translate-x-0 lg:w-20"
        }`}
      >
        {/* Header / Brand area */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] px-4">
          <button
            onClick={() => {
              if (!isOpen) onToggle();
              else onSelectTab("home");
            }}
            className="flex items-center space-x-3 text-left group overflow-hidden"
            title={isOpen ? "Go to Front Page" : "Click to expand sidebar"}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 text-black font-black shadow-[0_0_16px_rgba(6,182,212,0.4)] group-hover:scale-105 transition">
              <Newspaper className="h-5 w-5" />
            </div>
            {isOpen && (
              <div className="flex flex-col truncate">
                <span className="font-['Cinzel'] text-base font-extrabold tracking-wider text-slate-100 flex items-center space-x-1.5">
                  <span>NEWSBOT</span>
                  <span className="rounded bg-cyan-500/20 px-1 py-0.2 text-[9px] font-mono text-cyan-300">AI</span>
                </span>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  Indian Press Wire
                </span>
              </div>
            )}
          </button>

          {/* Toggle Button */}
          <button
            id="sidebar-toggle-btn"
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
          {/* Main Navigation Items */}
          <div className="space-y-1">
            {isOpen && (
              <div className="px-2 mb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Navigation
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  title={!isOpen ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl transition-all ${
                    isOpen ? "px-3 py-2.5 space-x-3 text-left" : "justify-center h-11"
                  } ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-semibold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <Icon
                    className={`shrink-0 ${isOpen ? "h-4 w-4" : "h-5 w-5"} ${
                      isActive ? "text-cyan-400" : "text-slate-400"
                    }`}
                  />
                  {isOpen && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate">{item.label}</span>
                        {item.badge && (
                          <span className="rounded bg-cyan-400/20 px-1.5 py-0.5 text-[9px] font-mono text-cyan-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Broadsheet Quick Filters (Visible when sidebar is open) */}
          {isOpen && (
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 flex items-center space-x-1.5">
                  <Layers className="h-3 w-3 text-cyan-400" />
                  <span>Broadsheets</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {articlesCount} stories
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    onSelectSource("all");
                    if (activeTab !== "home" && activeTab !== "news") onSelectTab("news");
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                    selectedSource === "all"
                      ? "bg-white/[0.08] text-cyan-300 font-medium"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
                    <span>All Indian Papers</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">{articlesCount}</span>
                </button>

                {newspapers.map((paper) => {
                  const isSelected =
                    selectedSource.toLowerCase() === paper.slug.toLowerCase() ||
                    selectedSource.toLowerCase() === paper.name.toLowerCase();

                  return (
                    <button
                      key={paper.slug}
                      onClick={() => {
                        onSelectSource(paper.slug);
                        if (activeTab !== "home" && activeTab !== "news") onSelectTab("news");
                      }}
                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                        isSelected
                          ? "bg-white/[0.08] text-cyan-300 font-medium"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className="flex items-center space-x-2 truncate">
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: paper.color || "#06b6d4" }}
                        ></span>
                        <span className="truncate">{paper.name}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 shrink-0">
                        {paper.liveCount ?? ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions Panel */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
            {isOpen && (
              <div className="px-2 mb-1 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                Actions & Alerts
              </div>
            )}

            {/* Fetch Now */}
            <button
              id="sidebar-fetch-now"
              onClick={onTriggerFetchNow}
              disabled={isFetchingNow}
              title={!isOpen ? "Fetch Latest Editions" : undefined}
              className={`w-full flex items-center rounded-xl transition ${
                isOpen ? "px-3 py-2 space-x-3 text-left" : "justify-center h-10"
              } bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30`}
            >
              <RefreshCw className={`h-4 w-4 shrink-0 ${isFetchingNow ? "animate-spin text-cyan-400" : ""}`} />
              {isOpen && (
                <div className="flex-1 truncate">
                  <div className="text-xs font-semibold">
                    {isFetchingNow ? "Syncing Editions..." : "Fetch Latest Wire"}
                  </div>
                  <div className="text-[10px] text-cyan-400/80 font-mono">Live Press Sync</div>
                </div>
              )}
            </button>

            {/* Alerts Drawer Trigger */}
            <button
              id="sidebar-alerts-btn"
              onClick={onOpenAlerts}
              title={!isOpen ? `Alerts (${unreadAlertsCount} unread)` : undefined}
              className={`w-full flex items-center rounded-xl transition relative ${
                isOpen ? "px-3 py-2 space-x-3 text-left" : "justify-center h-10"
              } text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]`}
            >
              <div className="relative">
                <Bell className="h-4 w-4 shrink-0" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                )}
              </div>
              {isOpen && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="text-xs">Intelligence Alerts</span>
                  {unreadAlertsCount > 0 && (
                    <span className="rounded-full bg-cyan-500 px-1.5 py-0.5 text-[10px] font-mono font-bold text-black">
                      {unreadAlertsCount}
                    </span>
                  )}
                </div>
              )}
            </button>

            {/* Reader Feedback */}
            <button
              id="sidebar-feedback-btn"
              onClick={onOpenFeedback}
              title={!isOpen ? "Reader Feedback" : undefined}
              className={`w-full flex items-center rounded-xl transition ${
                isOpen ? "px-3 py-2 space-x-3 text-left" : "justify-center h-10"
              } text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]`}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              {isOpen && <span className="text-xs">Send Feedback</span>}
            </button>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-white/[0.08] p-3 shrink-0 bg-[#080b10]">
          <button
            id="sidebar-profile-btn"
            onClick={onOpenRegister}
            className={`w-full flex items-center rounded-xl p-2 transition text-left hover:bg-white/[0.04] ${
              isOpen ? "space-x-3" : "justify-center"
            }`}
            title="Reader Preferences & Profile"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 text-xs font-bold text-cyan-300 border border-white/[0.1]">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "SG"}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0 truncate">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {user?.name || "Sashmitha Gandhi"}
                </div>
                <div className="text-[10px] text-slate-500 truncate font-mono">
                  {user?.email || "Reader Profile"}
                </div>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
