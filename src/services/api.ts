import {
  Article,
  SourceMeta,
  AlertItem,
  ChatResponse,
  CompareResult,
  AnalyticsData,
  Agency,
  UserProfile
} from "../types";

const BASE_URL = ""; // Relative calls hit Express directly

export const api = {
  // Articles
  async getArticles(params?: {
    newspaper?: string;
    search?: string;
    category?: string;
    limit?: number;
  }): Promise<{ count: number; totalAvailable: number; articles: Article[] }> {
    const query = new URLSearchParams();
    if (params?.newspaper && params.newspaper !== "all") query.set("newspaper", params.newspaper);
    if (params?.search) query.set("search", params.search);
    if (params?.category && params.category !== "all") query.set("category", params.category);
    if (params?.limit) query.set("limit", String(params.limit));

    const res = await fetch(`/articles?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch articles");
    return res.json();
  },

  async getArticlesByNewspaper(newspaperSlug: string): Promise<{ newspaper: string; count: number; articles: Article[] }> {
    const res = await fetch(`/articles/${encodeURIComponent(newspaperSlug)}`);
    if (!res.ok) throw new Error("Failed to fetch newspaper articles");
    return res.json();
  },

  // AI Chat
  async sendChatMessage(message: string, source_filter?: string): Promise<ChatResponse> {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, source_filter }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to query AI NewsBot");
    }
    return res.json();
  },

  // Alerts
  async getAlerts(): Promise<{ unreadCount: number; totalCount: number; alerts: AlertItem[] }> {
    const res = await fetch("/alerts");
    if (!res.ok) throw new Error("Failed to fetch alerts");
    return res.json();
  },

  async markAlertRead(alertId: string): Promise<void> {
    const res = await fetch(`/alerts/${encodeURIComponent(alertId)}/read`, {
      method: "PUT",
    });
    if (!res.ok) throw new Error("Failed to mark alert as read");
  },

  // Fetch Now (Sync Latest Morning Editions)
  async fetchNow(): Promise<{ success: boolean; message: string; articlesIndexed: number; alertCreated?: AlertItem }> {
    const res = await fetch("/fetch-now", {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to trigger instant fetch");
    return res.json();
  },

  // Archive
  async searchArchive(params: {
    keyword?: string;
    date_from?: string;
    date_to?: string;
    newspaper?: string;
    category?: string;
    sort?: string;
  }): Promise<{ totalMatched: number; articles: Article[] }> {
    const query = new URLSearchParams();
    if (params.keyword) query.set("keyword", params.keyword);
    if (params.date_from) query.set("date_from", params.date_from);
    if (params.date_to) query.set("date_to", params.date_to);
    if (params.newspaper && params.newspaper !== "all") query.set("newspaper", params.newspaper);
    if (params.category && params.category !== "all") query.set("category", params.category);
    if (params.sort) query.set("sort", params.sort);

    const res = await fetch(`/archive?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to search archive");
    return res.json();
  },

  // Newspaper Comparison
  async compareTopic(topic: string): Promise<CompareResult> {
    const res = await fetch(`/compare?topic=${encodeURIComponent(topic)}`);
    if (!res.ok) throw new Error("Failed to fetch newspaper comparison");
    return res.json();
  },

  // User Registration
  async registerUser(name: string, email: string, preferredSources?: string[]): Promise<{ success: boolean; message: string; user: UserProfile; isNew: boolean }> {
    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, preferredSources }),
    });
    if (!res.ok) throw new Error("Failed to complete user registration");
    return res.json();
  },

  // Feedback
  async submitFeedback(rating: number, feature: string, comment?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch("/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, feature, comment }),
    });
    if (!res.ok) throw new Error("Failed to submit feedback");
    return res.json();
  },

  // Newspapers
  async getNewspapers(): Promise<{ count: number; newspapers: SourceMeta[] }> {
    const res = await fetch("/newspapers");
    if (!res.ok) throw new Error("Failed to fetch newspapers");
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch("/analytics");
    if (!res.ok) throw new Error("Failed to fetch analytics telemetry");
    return res.json();
  },

  // Agencies Marketplace
  async getAgencies(params?: {
    newspaper?: string;
    max_budget?: number;
    specialization?: string;
  }): Promise<{ count: number; agencies: Agency[] }> {
    const query = new URLSearchParams();
    if (params?.newspaper && params.newspaper !== "all") query.set("newspaper", params.newspaper);
    if (params?.max_budget) query.set("max_budget", String(params.max_budget));
    if (params?.specialization && params.specialization !== "all") query.set("specialization", params.specialization);

    const res = await fetch(`/agencies?${query.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch agency marketplace");
    return res.json();
  },

  async getAgencyDetails(agencyId: string): Promise<{ agency: Agency; availableSlots: Array<{ format: string; dimension: string; estimatedReach: string; rate: string }> }> {
    const res = await fetch(`/agencies/${encodeURIComponent(agencyId)}`);
    if (!res.ok) throw new Error("Failed to fetch agency details");
    return res.json();
  }
};
