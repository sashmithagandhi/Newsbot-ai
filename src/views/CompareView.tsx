import React, { useState, useEffect } from "react";
import {
  GitCompare,
  Search,
  Sparkles,
  ExternalLink,
  Clock,
  Quote,
  Layers,
  ArrowUpRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { CompareResult, Article } from "../types";
import { api } from "../services/api";
import { SourceBadge } from "../components/SourceBadge";

interface CompareViewProps {
  initialTopic?: string;
  onSelectArticle: (article: Article) => void;
  onAskAi: (queryOrArticle: string | Article) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  initialTopic = "Union Budget",
  onSelectArticle,
  onAskAi,
}) => {
  const [topicInput, setTopicInput] = useState(initialTopic);
  const [currentTopic, setCurrentTopic] = useState(initialTopic);
  const [compareData, setCompareData] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedTopics = [
    "Union Budget",
    "ISRO Gaganyaan",
    "Supreme Court",
    "Semiconductor Fab",
    "Renewable Energy",
    "UPI & DPI"
  ];

  const fetchComparison = async (topic: string) => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.compareTopic(topic.trim());
      setCompareData(data);
      setCurrentTopic(topic.trim());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load newspaper comparison";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(initialTopic);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComparison(topicInput);
  };

  const getSourceAccent = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("hindu")) return { border: "border-sky-500/30", text: "text-sky-400", bg: "bg-sky-950/20" };
    if (s.includes("times")) return { border: "border-rose-500/30", text: "text-rose-400", bg: "bg-rose-950/20" };
    if (s.includes("express")) return { border: "border-amber-500/30", text: "text-amber-400", bg: "bg-amber-950/20" };
    return { border: "border-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-950/20" };
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Topic Selector */}
      <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#111724] to-[#0a0e15] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              <GitCompare className="h-4 w-4" />
              <span>Multi-Source Editorial Analysis Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Newspaper Comparison Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Compare how India's foremost editorial broadsheets covered key national, economic, and policy issues side-by-side.
            </p>
          </div>

          {/* Topic Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Enter topic: e.g. Union Budget, ISRO..."
                className="w-full rounded-lg border border-white/[0.12] bg-[#0c1119] px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 shrink-0"
            >
              {loading ? "COMPARING..." : "COMPARE"}
            </button>
          </form>
        </div>

        {/* Suggested Topic Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/[0.06] text-xs">
          <span className="text-slate-500 font-mono text-[11px] mr-1">Popular Comparisons:</span>
          {suggestedTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => {
                setTopicInput(topic);
                fetchComparison(topic);
              }}
              className={`rounded-full border px-3 py-0.5 text-[11px] font-mono transition ${
                currentTopic.toLowerCase() === topic.toLowerCase()
                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
                  : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/[0.15] hover:text-slate-200"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Synthesis Insight Banner */}
      {compareData && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 shadow-[0_0_20px_rgba(6,182,212,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>AI Comparative Editorial Synthesis • "{compareData.topic}"</span>
            </div>
            <button
              onClick={() =>
                onAskAi(`Compare in detail how The Hindu, Times of India, and Indian Express reported on "${compareData.topic}". What are the key points of divergence?`)
              }
              className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-300 hover:text-cyan-200"
            >
              <span>Ask NewsBot for Deep Dive</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-sm text-cyan-100/90 leading-relaxed font-sans">
            {compareData.summary}
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-96 rounded-xl border border-white/[0.08] bg-[#0e131b] p-4 animate-pulse space-y-3"
            >
              <div className="h-5 w-24 bg-slate-800 rounded"></div>
              <div className="h-32 w-full bg-slate-800 rounded-lg"></div>
              <div className="h-6 w-full bg-slate-800 rounded"></div>
              <div className="h-16 w-full bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-6 text-center text-rose-300">
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-2" />
          <h3 className="font-bold text-base">Comparison Ingestion Error</h3>
          <p className="text-xs text-rose-300/80 mt-1">{error}</p>
        </div>
      )}

      {/* Side-by-Side 4-Column Newspaper Comparison Experience */}
      {compareData && !loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {compareData.matrix.map((col) => {
              const accent = getSourceAccent(col.source);
              const article = col.leadArticle;

              return (
                <div
                  key={col.source}
                  className={`flex flex-col justify-between rounded-xl border ${accent.border} bg-[#0c1119] p-4 transition-all hover:shadow-[0_0_25px_rgba(0,0,0,0.7)]`}
                >
                  <div>
                    {/* Source Header Column Banner */}
                    <div className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                      <SourceBadge source={col.source} size="sm" />
                      <span className="font-mono text-[10px] text-slate-500">
                        {col.articleCount} {col.articleCount === 1 ? "Story" : "Stories"}
                      </span>
                    </div>

                    {/* Framing Angle Badge */}
                    <div className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 space-y-1 text-xs">
                      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                        Editorial Framing Angle:
                      </div>
                      <p className={`font-semibold ${accent.text} line-clamp-2`}>
                        {col.primaryFocus}
                      </p>
                    </div>

                    {/* Lead Story Card */}
                    {article ? (
                      <div className="space-y-3">
                        {article.imageUrl && (
                          <div
                            onClick={() => onSelectArticle(article)}
                            className="overflow-hidden rounded-lg aspect-video border border-white/[0.06] bg-slate-950 cursor-pointer"
                          >
                            <img
                              src={article.imageUrl}
                              alt={article.headline}
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </div>
                        )}

                        <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{new Date(article.publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                          <span>•</span>
                          <span>Tone: {col.editorialTone}</span>
                        </div>

                        <h3
                          onClick={() => onSelectArticle(article)}
                          className="font-bold text-sm tracking-tight text-slate-100 hover:text-cyan-300 transition cursor-pointer line-clamp-3 leading-snug"
                        >
                          {article.headline}
                        </h3>

                        <p className="text-xs text-slate-400 line-clamp-4 leading-relaxed">
                          {article.description}
                        </p>

                        {/* Distinct Key Quote */}
                        {col.keyQuotes && col.keyQuotes.length > 0 && (
                          <div className="rounded border-l-2 border-white/30 bg-white/[0.02] p-2 text-[11px] italic text-slate-300">
                            "{col.keyQuotes[0]}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-500 space-y-2">
                        <Layers className="h-8 w-8 text-slate-600 mx-auto opacity-40" />
                        <p className="text-xs font-mono">No specific coverage on this topic indexed in today's cycle.</p>
                      </div>
                    )}
                  </div>

                  {/* Column Footer Controls */}
                  {article && (
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <button
                        onClick={() => onSelectArticle(article)}
                        className="font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center space-x-1"
                      >
                        <span>Read Story</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>

                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-200 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
