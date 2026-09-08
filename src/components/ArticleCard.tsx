import React from "react";
import { Clock, ExternalLink, Sparkles, ArrowUpRight } from "lucide-react";
import { Article } from "../types";
import { SourceBadge } from "./SourceBadge";

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
  onAskAi: (article: Article) => void;
  featured?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSelect,
  onAskAi,
  featured = false,
}) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "08 Sep 2026";
    }
  };

  if (featured) {
    return (
      <div className="group relative overflow-hidden rounded-xl border border-white/[0.1] bg-gradient-to-b from-[#131923] to-[#0c1017] p-5 md:p-7 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.12)]">
        {/* Background ambient glow on hover */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl transition-opacity group-hover:opacity-100"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Image banner */}
          <div className="lg:col-span-6 overflow-hidden rounded-lg border border-white/[0.06] bg-slate-900 relative aspect-video">
            <img
              src={article.imageUrl}
              alt={article.headline}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                // Fallback graphic placeholder if image fails
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-transparent to-transparent opacity-60"></div>
            <div className="absolute top-3 left-3">
              <SourceBadge source={article.source} size="md" />
            </div>
            <div className="absolute bottom-3 left-3 flex items-center space-x-2 rounded bg-black/70 backdrop-blur-md px-2.5 py-1 text-xs font-mono text-slate-300 border border-white/10">
              <Clock className="h-3 w-3 text-cyan-400" />
              <span>{article.readTime}</span>
              <span className="text-slate-600">•</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </div>

          {/* Content info */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="mb-2 flex items-center space-x-2">
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                  {article.category}
                </span>
                {article.sentiment && (
                  <span className="rounded bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-slate-400 border border-white/[0.08]">
                    Tone: {article.sentiment}
                  </span>
                )}
              </div>

              <h2
                onClick={() => onSelect(article)}
                className="cursor-pointer text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 group-hover:text-cyan-200 transition-colors leading-snug"
              >
                {article.headline}
              </h2>

              <p className="mt-3 text-sm text-slate-300/90 line-clamp-3 leading-relaxed">
                {article.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onSelect(article)}
                  className="inline-flex items-center space-x-1.5 rounded-lg bg-cyan-500/15 px-3.5 py-2 text-xs font-semibold text-cyan-300 border border-cyan-500/30 transition hover:bg-cyan-500/25 hover:border-cyan-400"
                >
                  <span>Read Full Dispatch</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onAskAi(article)}
                  className="inline-flex items-center space-x-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-500/30 hover:bg-cyan-950/30 hover:text-cyan-300"
                  title="Analyze with AI NewsBot"
                >
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Ask NewsBot</span>
                </button>
              </div>

              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                <span>Original {article.source}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid Article Card
  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-xl border border-white/[0.07] bg-[#0e131b] p-4 transition-all duration-300 hover:border-cyan-500/35 hover:bg-[#111722] hover:shadow-[0_0_20px_rgba(6,182,212,0.08)]">
      <div>
        {/* Card Header & Source */}
        <div className="mb-3 flex items-center justify-between">
          <SourceBadge source={article.source} size="sm" />
          <span className="font-mono text-[10px] text-slate-400 flex items-center space-x-1">
            <Clock className="h-3 w-3 text-slate-400 inline mr-0.5" />
            {formatDate(article.publishedAt)}
          </span>
        </div>

        {/* Optional Image */}
        {article.imageUrl && (
          <div
            onClick={() => onSelect(article)}
            className="mb-3 overflow-hidden rounded-lg aspect-[16/9] border border-white/[0.05] bg-slate-900 cursor-pointer"
          >
            <img
              src={article.imageUrl}
              alt={article.headline}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Category Pill */}
        <div className="mb-1.5">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-400/90">
            [{article.category}]
          </span>
        </div>

        {/* Headline */}
        <h3
          onClick={() => onSelect(article)}
          className="cursor-pointer font-bold text-base tracking-tight text-slate-100 group-hover:text-cyan-200 transition-colors line-clamp-2 leading-snug"
        >
          {article.headline}
        </h3>

        {/* Snippet Description */}
        <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
          {article.description}
        </p>
      </div>

      {/* Footer controls */}
      <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
        <button
          onClick={() => onSelect(article)}
          className="text-xs font-semibold text-cyan-400/90 hover:text-cyan-300 flex items-center space-x-1 transition"
        >
          <span>Read Analysis</span>
          <ArrowUpRight className="h-3 w-3" />
        </button>

        <button
          onClick={() => onAskAi(article)}
          className="flex items-center space-x-1 rounded px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-transparent hover:border-cyan-500/20 transition"
          title="Query NewsBot AI on this story"
        >
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Ask AI</span>
        </button>
      </div>
    </div>
  );
};
