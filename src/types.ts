export interface Article {
  id: string;
  headline: string;
  description: string;
  content: string;
  source: string;
  sourceSlug: string;
  category: "Politics" | "Economy" | "Technology" | "Science" | "National" | "International" | "Opinion";
  publishedAt: string;
  author: string;
  readTime: string;
  imageUrl: string;
  url: string;
  tags: string[];
  sentiment?: "Positive" | "Neutral" | "Analytical" | "Critical";
  coverageAngle?: string;
  keyQuotes?: string[];
}

export interface SourceMeta {
  name: string;
  slug: string;
  tagline: string;
  bias: string;
  color: string;
  edition: string;
  status: string;
  articleCount?: number;
  liveCount?: number;
  lastUpdated: string;
  badge: string;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "system" | "breaking" | "edition" | "ai";
  actionUrl?: string;
}

export interface ChatSourceCitation {
  newspaper: string;
  headline: string;
  url: string;
  category?: string;
  date?: string;
  relevance: number;
}

export interface ChatResponse {
  query: string;
  answer: string;
  sources: ChatSourceCitation[];
  cited_articles?: Article[];
  sentiment: string;
  timestamp: string;
  searchLatencyMs?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: ChatSourceCitation[];
  citedArticles?: Article[];
  processingStages?: string[];
}

export interface ComparisonColumn {
  source: string;
  hasCoverage: boolean;
  articleCount: number;
  leadArticle: Article | null;
  primaryFocus: string;
  editorialTone: string;
  keyQuotes: string[];
  articles: Article[];
}

export interface CompareResult {
  topic: string;
  totalCrossArticles: number;
  sourcesCompared: string[];
  matrix: ComparisonColumn[];
  summary: string;
}

export interface AnalyticsData {
  totalArticlesIndexed: number;
  todayIndexedCount: number;
  activeSourcesCount: number;
  totalAiQueriesAnswered: number;
  avgResponseLatencyMs: number;
  sourceDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  sentimentTelemetry: {
    Positive: number;
    Analytical: number;
    Critical: number;
    Neutral: number;
  };
  dailyTelemetry: Array<{
    date: string;
    count: number;
    aiQueries: number;
  }>;
  topComparedTopics: Array<{
    topic: string;
    queries: number;
    consensus: string;
  }>;
  systemUptime: string;
  lastPipelineSync: string;
}

export interface AgencySlot {
  format: string;
  dimension: string;
  estimatedReach: string;
  rate: string;
}

export interface Agency {
  id: string;
  name: string;
  location: string;
  newspapers: string[];
  specialization: string;
  minBudget: number;
  maxBudget: number;
  rating: number;
  completedCampaigns: number;
  description: string;
  contactEmail: string;
  verified: boolean;
  imageUrl: string;
  availableSlots?: AgencySlot[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  preferredSources?: string[];
}
