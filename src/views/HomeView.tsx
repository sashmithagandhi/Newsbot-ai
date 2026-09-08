import React, { useState } from "react";
import {
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  Layers,
  SlidersHorizontal,
  Flame,
  Clock,
  RefreshCw
} from "lucide-react";
import { Article, SourceMeta } from "../types";
import { ArticleCard } from "../components/ArticleCard";
import { SourceBadge } from "../components/SourceBadge";

interface HomeViewProps {
  articles: Article[];
  newspapers: SourceMeta[];
  selectedSource: string;
  onSelectSource: (source: string) => void;
  onSelectArticle: (article: Article) => void;
  onAskAi: (queryOrArticle: string | Article) => void;
  onNavigateTo: (tab: "home" | "news" | "ai" | "compare" | "archive" | "analytics" | "agencies") => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  articles,
  newspapers,
  selectedSource,
  onSelectSource,
  onSelectArticle,
  onAskAi,
  onNavigateTo,
  isLoading,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = ["all", "Economy", "Politics", "Technology", "Science", "National", "International"];

  // Filter articles
  const filteredArticles = articles.filter((a) => {
    const matchesSource =
      selectedSource === "all" ||
      a.sourceSlug === selectedSource ||
      a.source.toLowerCase() === selectedSource.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      a.category.toLowerCase() === categoryFilter.toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      a.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSource && matchesCategory && matchesSearch;
  });

  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const secondaryArticles = filteredArticles.slice(1, 7);
  const latestHeadlines = articles.slice(0, 4);

  const suggestedPrompts = [
    "What happened in today's Indian politics?",
    "Summarize today's major economic news.",
    "What did The Hindu report about this?",
    "Compare today's coverage of Union Budget",
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Top Hero Masthead: Airy, High-Contrast & Journalistic */}
      <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#0e141f] via-[#090d14] to-[#070a0f] p-6 sm:p-10 shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>
        <div className="pointer-events-none absolute left-1/3 bottom-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-mono text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>TODAY'S INDIAN PRESS DISPATCHES • 5 BROADSHEETS INDEXED</span>
          </div>

          <h1 className="font-['Cinzel'] text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100 leading-tight">
            THE MORNING PRESS,<br />
            <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              CROSS-VERIFIED & SYNTHESIZED.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Multi-newspaper intelligence synthesizing reports from <strong>The Hindu</strong>, <strong>Times of India</strong>, <strong>Indian Express</strong>, and <strong>NDTV</strong> into structured editorial analysis.
          </p>

          {/* Dedicated AI Inquiry Input */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 rounded-xl border border-cyan-500/30 bg-[#070a10]/95 p-2 shadow-[0_0_25px_rgba(6,182,212,0.12)]">
              <div className="flex flex-1 items-center px-3 space-x-3">
                <Sparkles className="h-5 w-5 text-cyan-400 shrink-0 animate-pulse" />
                <input
                  type="text"
                  placeholder="Ask NewsBot anything: 'Summarize economic news', 'What did The Hindu report?'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      onAskAi(searchQuery.trim());
                    }
                  }}
                  className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  if (searchQuery.trim()) {
                    onAskAi(searchQuery.trim());
                  } else {
                    onNavigateTo("ai");
                  }
                }}
                className="inline-flex items-center justify-center space-x-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <span>QUERY AI</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">Suggested:</span>
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onAskAi(prompt)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-slate-300 hover:border-cyan-500/40 hover:bg-cyan-950/30 hover:text-cyan-200 transition"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Broadsheet Selection Bar */}
      <section className="space-y-4 rounded-xl border border-white/[0.06] bg-[#090d14]/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-100">Filter Broadsheet Feed</h2>
            <span className="font-mono text-xs text-slate-500">({filteredArticles.length} stories displayed)</span>
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Wire</span>
          </button>
        </div>

        {/* Source Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectSource("all")}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-mono font-medium transition ${
              selectedSource === "all"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "bg-white/[0.03] text-slate-400 border border-white/[0.08] hover:border-white/[0.15] hover:text-slate-200"
            }`}
          >
            All Papers ({articles.length})
          </button>

          {newspapers.map((source) => {
            const isSelected =
              selectedSource.toLowerCase() === source.slug.toLowerCase() ||
              selectedSource.toLowerCase() === source.name.toLowerCase();
            const count = articles.filter((a) => a.sourceSlug === source.slug).length;

            return (
              <button
                key={source.slug}
                onClick={() => onSelectSource(source.slug)}
                className={`flex items-center space-x-2 shrink-0 rounded-lg px-3.5 py-2 text-xs font-mono font-medium transition ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                    : "bg-white/[0.03] text-slate-400 border border-white/[0.08] hover:border-white/[0.15] hover:text-slate-200"
                }`}
              >
                <span className="font-semibold">{source.name}</span>
                <span className="rounded bg-white/[0.08] px-1.5 py-0.2 text-[10px] text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto text-xs scrollbar-none pt-1 border-t border-white/[0.04]">
          <span className="text-slate-500 font-mono text-[11px] mr-1 flex items-center">
            <SlidersHorizontal className="h-3 w-3 mr-1" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition capitalize ${
                categoryFilter === cat
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Lead Story Spotlight */}
      {featuredArticle && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
              <span>LEAD STORY IN FOCUS</span>
            </span>
            <span className="text-xs font-mono text-slate-500">Cross-verified by NewsBot</span>
          </div>
          <ArticleCard
            article={featuredArticle}
            onSelect={onSelectArticle}
            onAskAi={() => onAskAi(featuredArticle)}
            featured={true}
          />
        </section>
      )}

      {/* Secondary Stories Grid: Generous Breathing Room */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">National Broadsheet Grid</h3>
          </div>
          <button
            onClick={() => onNavigateTo("compare")}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition"
          >
            <span>Compare Coverage Across Papers</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-72 rounded-xl border border-white/[0.05] bg-slate-900/40 p-5 animate-pulse space-y-3"
              >
                <div className="h-4 w-24 bg-slate-800 rounded"></div>
                <div className="h-32 w-full bg-slate-800 rounded-lg"></div>
                <div className="h-5 w-3/4 bg-slate-800 rounded"></div>
                <div className="h-3 w-full bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : secondaryArticles.length === 0 ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#0c1017] p-12 text-center text-slate-400">
            <Layers className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-200">No Dispatches Matched Filter</h4>
            <p className="text-xs text-slate-500 mt-1">Try resetting source or category filters.</p>
            <button
              onClick={() => {
                onSelectSource("all");
                setCategoryFilter("all");
                setSearchQuery("");
              }}
              className="mt-4 rounded-lg bg-cyan-500/20 px-4 py-2 text-xs font-mono text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {secondaryArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onSelect={onSelectArticle}
                onAskAi={() => onAskAi(article)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bottom Cross-Paper & Archive Launchers */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
        <div
          onClick={() => onNavigateTo("compare")}
          className="group cursor-pointer rounded-xl border border-white/[0.08] bg-gradient-to-r from-cyan-950/30 to-[#0c1119] p-6 transition hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.1)] flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
              Multi-Newspaper Analysis
            </div>
            <h4 className="font-bold text-slate-100 text-base sm:text-lg group-hover:text-cyan-200 transition">
              Compare Editorial Perspectives
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              Analyze how The Hindu, Times of India, and Indian Express frame the same national policy story differently.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0 ml-4" />
        </div>

        <div
          onClick={() => onNavigateTo("archive")}
          className="group cursor-pointer rounded-xl border border-white/[0.08] bg-gradient-to-r from-purple-950/20 to-[#0c1119] p-6 transition hover:border-purple-500/40 hover:shadow-[0_0_25px_rgba(168,85,247,0.1)] flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-1">
              Intelligence Memory Vault
            </div>
            <h4 className="font-bold text-slate-100 text-base sm:text-lg group-hover:text-purple-200 transition">
              Search the News Intelligence Archive
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              Explore historical newspaper reports with precise dates, keyword vectors, and source filters.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform shrink-0 ml-4" />
        </div>
      </section>
    </div>
  );
};
