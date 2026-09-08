import React, { useState, useEffect } from "react";
import {
  Archive,
  Search,
  Calendar,
  Filter,
  ArrowUpDown,
  Clock,
  ExternalLink,
  Sparkles,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { Article } from "../types";
import { api } from "../services/api";
import { SourceBadge } from "../components/SourceBadge";
import { ArticleCard } from "../components/ArticleCard";

interface ArchiveViewProps {
  onSelectArticle: (article: Article) => void;
  onAskAi: (queryOrArticle: string | Article) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  onSelectArticle,
  onAskAi,
}) => {
  const [keyword, setKeyword] = useState("");
  const [dateFrom, setDateFrom] = useState("2026-09-01");
  const [dateTo, setDateTo] = useState("2026-09-08");
  const [newspaper, setNewspaper] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("date_desc");

  const [articles, setArticles] = useState<Article[]>([]);
  const [totalMatched, setTotalMatched] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const newspaperOptions = [
    { label: "All Broadsheets", value: "all" },
    { label: "The Hindu", value: "the-hindu" },
    { label: "Times of India", value: "times-of-india" },
    { label: "Indian Express", value: "indian-express" },
    { label: "NDTV", value: "ndtv" },
  ];

  const categoryOptions = [
    { label: "All Categories", value: "all" },
    { label: "Economy", value: "Economy" },
    { label: "Politics", value: "Politics" },
    { label: "Technology", value: "Technology" },
    { label: "Science", value: "Science" },
    { label: "National", value: "National" },
    { label: "International", value: "International" },
  ];

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await api.searchArchive({
        keyword: keyword.trim() || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        newspaper: newspaper !== "all" ? newspaper : undefined,
        category: category !== "all" ? category : undefined,
        sort: sort || undefined,
      });
      setArticles(data.articles);
      setTotalMatched(data.totalMatched);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleReset = () => {
    setKeyword("");
    setDateFrom("2026-09-01");
    setDateTo("2026-09-08");
    setNewspaper("all");
    setCategory("all");
    setSort("date_desc");
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#111724] to-[#0a0e15] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            <Archive className="h-4 w-4" />
            <span>Memory of the Newsroom</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            News Intelligence Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Query across historical dispatches, archived headlines, and editorial filings indexed from India's broadsheets.
          </p>
        </div>

        {/* Search Query & Filters Box */}
        <div className="mt-6 rounded-xl border border-white/[0.08] bg-[#0c1017] p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Keyword Input */}
            <div className="md:col-span-6 relative">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Search Keyword or Topic
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. Reserve Bank, Supreme Court, ISRO, Semiconductor..."
                  className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Date From */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-xs sm:text-sm text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Date To */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-xs sm:text-sm text-slate-200 focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Secondary Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2 border-t border-white/[0.05]">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Newspaper Source
              </label>
              <select
                value={newspaper}
                onChange={(e) => setNewspaper(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-[#101622] px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                {newspaperOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-[#101622] px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Sort Order
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-[#101622] px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
              >
                <option value="date_desc">Newest to Oldest</option>
                <option value="date_asc">Oldest to Newest</option>
                <option value="relevance">Relevance Vector</option>
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 rounded-lg bg-cyan-500 py-2 text-xs font-bold text-black hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                {loading ? "SEARCHING..." : "QUERY ARCHIVE"}
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border border-white/[0.1] p-2 text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
                title="Reset filters"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs font-mono">
        <div className="flex items-center space-x-2 text-slate-300">
          <BookOpen className="h-4 w-4 text-cyan-400" />
          <span>ARCHIVE RESULTS:</span>
          <span className="font-bold text-cyan-400">{totalMatched} records matched</span>
        </div>

        {keyword && (
          <span className="text-slate-500">
            Vector query: <span className="text-slate-300">"{keyword}"</span>
          </span>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-white/[0.05] bg-slate-900/40 p-4 animate-pulse space-y-3"
            >
              <div className="h-4 w-20 bg-slate-800 rounded"></div>
              <div className="h-28 w-full bg-slate-800 rounded-lg"></div>
              <div className="h-5 w-3/4 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1017] p-16 text-center text-slate-500">
          <Archive className="h-12 w-12 text-slate-600 mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-slate-300">No Dispatches in Selected Range</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your keyword or widening the date interval.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art) => (
            <ArticleCard
              key={art.id}
              article={art}
              onSelect={onSelectArticle}
              onAskAi={() => onAskAi(art)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
