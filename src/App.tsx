import React, { useState, useEffect } from "react";
import { Navigation, NavTab } from "./components/Navigation";
import { Sidebar } from "./components/Sidebar";
import { Article, SourceMeta, AlertItem, UserProfile } from "./types";
import { api } from "./services/api";

import { HomeView } from "./views/HomeView";
import { ExploreView } from "./views/ExploreView";
import { AiChatView } from "./views/AiChatView";
import { CompareView } from "./views/CompareView";
import { ArchiveView } from "./views/ArchiveView";
import { AnalyticsView } from "./views/AnalyticsView";
import { AgenciesView } from "./views/AgenciesView";

import { ArticleDetailModal } from "./components/ArticleDetailModal";
import { AlertsDrawer } from "./components/AlertsDrawer";
import { RegistrationModal } from "./components/RegistrationModal";
import { FeedbackModal } from "./components/FeedbackModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [newspapers, setNewspapers] = useState<SourceMeta[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [loadingArticles, setLoadingArticles] = useState<boolean>(true);

  // Modals & Drawers
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [alertsOpen, setAlertsOpen] = useState<boolean>(false);
  const [registerOpen, setRegisterOpen] = useState<boolean>(false);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);

  // Alerts state
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(0);
  const [isFetchingNow, setIsFetchingNow] = useState<boolean>(false);

  // User Profile
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("newsbot_user");
      return saved ? JSON.parse(saved) : {
        id: "usr_default",
        name: "Sashmitha Gandhi",
        email: "sashmithagandhi6@gmail.com",
        registeredAt: new Date().toISOString(),
        preferredSources: ["The Hindu", "Times of India", "Indian Express", "NDTV"]
      };
    } catch {
      return null;
    }
  });

  // AI Chat Pre-fill
  const [aiInitialQuery, setAiInitialQuery] = useState<string>("");
  const [aiInitialArticle, setAiInitialArticle] = useState<Article | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initial Data Fetch
  const loadData = async () => {
    setLoadingArticles(true);
    try {
      const [artRes, npRes, alertRes] = await Promise.all([
        api.getArticles(),
        api.getNewspapers(),
        api.getAlerts()
      ]);
      setArticles(artRes.articles);
      setNewspapers(npRes.newspapers);
      setAlerts(alertRes.alerts);
      setUnreadAlertsCount(alertRes.unreadCount);
    } catch (err) {
      console.error("Failed to load newsroom telemetry:", err);
    } finally {
      setLoadingArticles(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Poll alerts every 45s
  useEffect(() => {
    const alertPoll = setInterval(async () => {
      try {
        const res = await api.getAlerts();
        setAlerts(res.alerts);
        setUnreadAlertsCount(res.unreadCount);
      } catch {
        // silent
      }
    }, 45000);
    return () => clearInterval(alertPoll);
  }, []);

  // Handler for Fetch Now (Fresh morning editions sync)
  const handleTriggerFetchNow = async () => {
    if (isFetchingNow) return;
    setIsFetchingNow(true);
    try {
      const res = await api.fetchNow();
      showToast(`⚡ ${res.message} (${res.articlesIndexed} articles ingested)`);
      // Reload dispatches and alerts
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch morning editions";
      showToast(`Error: ${msg}`);
    } finally {
      setIsFetchingNow(false);
    }
  };

  // Handler for Mark Alert as Read
  const handleMarkAlertRead = async (alertId: string) => {
    try {
      await api.markAlertRead(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
      );
      setUnreadAlertsCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // Handler for Mark All Alerts Read
  const handleMarkAllAlertsRead = async () => {
    try {
      for (const a of alerts.filter((item) => !item.read)) {
        await api.markAlertRead(a.id);
      }
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
      setUnreadAlertsCount(0);
      showToast("All telemetry alerts marked as read");
    } catch (err) {
      console.error(err);
    }
  };

  // Handler for Ask AI from any card or prompt
  const handleAskAi = (queryOrArticle: string | Article) => {
    if (typeof queryOrArticle === "string") {
      setAiInitialQuery(queryOrArticle);
      setAiInitialArticle(null);
    } else {
      setAiInitialArticle(queryOrArticle);
      setAiInitialQuery("");
    }
    setActiveTab("ai");
  };

  // Handler for User Registration
  const handleRegisterUser = async (name: string, email: string, preferredSources: string[]) => {
    const res = await api.registerUser(name, email, preferredSources);
    setUser(res.user);
    try {
      localStorage.setItem("newsbot_user", JSON.stringify(res.user));
    } catch {
      // Handled
    }
    showToast(`Identity confirmed: Welcome, ${res.user.name}`);
  };

  // Handler for Feedback
  const handleFeedbackSubmit = async (rating: number, feature: string, comment?: string) => {
    await api.submitFeedback(rating, feature, comment);
    showToast("Feedback telemetry transmitted to engineering desk");
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black antialiased flex flex-col lg:flex-row">
      {/* Left Collapsible/Expandable Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (window.innerWidth < 1024) {
            setSidebarOpen(false);
          }
        }}
        newspapers={newspapers}
        selectedSource={selectedSource}
        onSelectSource={setSelectedSource}
        unreadAlertsCount={unreadAlertsCount}
        onOpenAlerts={() => setAlertsOpen(true)}
        onOpenRegister={() => setRegisterOpen(true)}
        onOpenFeedback={() => setFeedbackOpen(true)}
        onTriggerFetchNow={handleTriggerFetchNow}
        isFetchingNow={isFetchingNow}
        user={user}
        articlesCount={articles.length}
      />

      {/* Main View Area (shifts smoothly based on sidebar state) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarOpen ? "lg:pl-72" : "lg:pl-20"
        }`}
      >
        {/* Top Navigation & Status Bar */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadAlertsCount={unreadAlertsCount}
          onOpenAlerts={() => setAlertsOpen(true)}
          onOpenRegister={() => setRegisterOpen(true)}
          onOpenFeedback={() => setFeedbackOpen(true)}
          onTriggerFetchNow={handleTriggerFetchNow}
          isFetchingNow={isFetchingNow}
          user={user}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />

        {/* View Container with spacious breathing room */}
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
          {activeTab === "home" && (
            <HomeView
              articles={articles}
              newspapers={newspapers}
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
              onSelectArticle={setSelectedArticle}
              onAskAi={handleAskAi}
              onNavigateTo={setActiveTab}
              isLoading={loadingArticles}
              onRefresh={loadData}
            />
          )}

          {activeTab === "news" && (
            <ExploreView
              articles={articles}
              newspapers={newspapers}
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
              onSelectArticle={setSelectedArticle}
              onAskAi={handleAskAi}
              onRefresh={loadData}
            />
          )}

          {activeTab === "ai" && (
            <AiChatView
              initialQuery={aiInitialQuery}
              initialArticle={aiInitialArticle}
              onClearInitial={() => {
                setAiInitialQuery("");
                setAiInitialArticle(null);
              }}
              onSelectArticle={setSelectedArticle}
            />
          )}

          {activeTab === "compare" && (
            <CompareView
              initialTopic="Union Budget"
              onSelectArticle={setSelectedArticle}
              onAskAi={handleAskAi}
            />
          )}

          {activeTab === "archive" && (
            <ArchiveView
              onSelectArticle={setSelectedArticle}
              onAskAi={handleAskAi}
            />
          )}

          {activeTab === "analytics" && <AnalyticsView />}

          {activeTab === "agencies" && <AgenciesView />}
        </main>
      </div>

      {/* Floating System Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-cyan-500/40 bg-[#090d14]/95 px-4 py-2.5 text-xs font-mono text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.25)] backdrop-blur-md animate-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}

      {/* Modals & Overlays */}
      <ArticleDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onAskAi={(art) => {
          setSelectedArticle(null);
          handleAskAi(art);
        }}
      />

      <AlertsDrawer
        isOpen={alertsOpen}
        onClose={() => setAlertsOpen(false)}
        alerts={alerts}
        onMarkAsRead={handleMarkAlertRead}
        onMarkAllAsRead={handleMarkAllAlertsRead}
        onTriggerFetchNow={handleTriggerFetchNow}
        isFetchingNow={isFetchingNow}
        onNavigateTo={(tab) => {
          if (["home", "news", "ai", "compare", "archive", "analytics", "agencies"].includes(tab)) {
            setActiveTab(tab as NavTab);
          } else {
            setActiveTab("news");
          }
        }}
      />

      <RegistrationModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        currentUser={user}
        onRegister={handleRegisterUser}
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
}
