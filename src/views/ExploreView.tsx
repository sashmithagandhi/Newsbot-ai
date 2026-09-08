import React, { useState } from "react";
import {
  Compass,
  Search,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  RefreshCw
} from "lucide-react";
import { Article, SourceMeta } from "../types";
import { ArticleCard } from "../components/ArticleCard";
import { SourceBadge } from "../components/SourceBadge";

interface ExploreViewProps {
  articles: Article[];
  newspapers: SourceMeta[];
  selectedSource: string;
  onSelectSource: (source: string) => void;
  onSelectArticle: (article: Article) => void;
  onAskAi: (queryOrArticle: string | Article) => void;
  onRefresh: () => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  articles,
  newspapers,
  selectedSource,
  onSelectSource,
  onSelectArticle,
  onAskAi,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "sentiment">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = ["all", "Economy", "Politics", "Technology", "Science", "National", "International"];

  const filteredArticles = articles
    .filter((a) => {
      const matchesSource =
        selectedSource === "all" ||
        a.sourceSlug === selectedSource ||
        a.source.toLowerCase() === selectedSource.toLowerCase();

      const matchesCat =
        categoryFilter === "all" ||
        a.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchesSearch =
        !searchQuery.trim() ||
        a.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSource && matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      return (a.sentiment || "").localeCompare(b.sentiment || "");
    });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#111724] to-[#0a0e15] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            <Compass className="h-4 w-4" />
            <span>Broadsheet Wire Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Explore All Broadsheets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Filter, search, and browse dispatches across The Hindu, Times of India, Indian Express, and NDTV with multi-faceted sorting.
          </p>
        </div>

        {/* Source selector bar */}
        <div className="mt-6 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectSource("all")}
            className={`shrink-0 rounded-lg px-3.5 py-2 text-xs font-mono font-medium transition ${
              selectedSource === "all"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                : "bg-white/[0.03] text-slate-400 border border-white/[0.08] hover:text-slate-200"
            }`}
          >
            All Broadsheets ({articles.length})
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
                    : "bg-white/[0.03] text-slate-400 border border-white/[0.08] hover:text-slate-200"
                }`}
              >
                <span>{source.name}</span>
                <span className="rounded bg-white/[0.08] px-1.5 py-0.2 text-[10px] text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0c1017] p-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within dispatches, tags, or authors..."
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Categories & Sorting Controls */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-white/[0.1] bg-[#111722] px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "sentiment")}
            className="rounded-lg border border-white/[0.1] bg-[#111722] px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="sentiment">Sort: Editorial Tone</option>
          </select>

          <button
            onClick={onRefresh}
            className="rounded-lg border border-white/[0.1] p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.05]"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Articles Grid / Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.length === 0 ? (
          <div className="col-span-full rounded-xl border border-white/[0.08] bg-[#0c1017] p-12 text-center text-slate-400">
            <Layers className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-200">No Dispatches Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search query or source filter.</p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onSelect={onSelectArticle}
              onAskAi={() => onAskAi(article)}
            />
          ))
        )}
      </div>
    </div>
  );
};
