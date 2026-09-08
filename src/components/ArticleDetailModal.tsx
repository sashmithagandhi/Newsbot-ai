import React from "react";
import { X, ExternalLink, Sparkles, Clock, User, Tag, Quote, ShieldCheck } from "lucide-react";
import { Article } from "../types";
import { SourceBadge } from "./SourceBadge";

interface ArticleDetailModalProps {
  article: Article | null;
  onClose: () => void;
  onAskAi: (article: Article) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  article,
  onClose,
  onAskAi,
}) => {
  if (!article) return null;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "08 September 2026";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-white/[0.12] bg-[#0d121a] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden my-8">
        {/* Top telemetry bar */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#090d14] px-6 py-3.5">
          <div className="flex items-center space-x-3">
            <SourceBadge source={article.source} size="md" />
            <span className="font-mono text-xs text-slate-400">
              DISPATCH ID: #{article.id.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[80vh] overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Category & Tone */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-cyan-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-cyan-400 border border-cyan-500/25">
              {article.category}
            </span>
            {article.sentiment && (
              <span className="rounded bg-white/[0.04] px-2.5 py-0.5 font-mono text-xs text-slate-300 border border-white/[0.08]">
                Editorial Tone: {article.sentiment}
              </span>
            )}
            <span className="flex items-center space-x-1 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Verified Indian Newsroom Source</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 leading-snug">
            {article.headline}
          </h1>

          {/* Metadata Byline */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 border-y border-white/[0.06] py-3">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <User className="h-3.5 w-3.5 text-cyan-400" />
              <span>{article.author}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{article.readTime}</span>
            </span>
            <span>•</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>

          {/* Hero image if present */}
          {article.imageUrl && (
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-slate-950 aspect-video relative">
              <img
                src={article.imageUrl}
                alt={article.headline}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-2 right-3 rounded bg-black/70 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                Photo courtesy: {article.source} Press Wire
              </div>
            </div>
          )}

          {/* Editorial Angle Callout */}
          {article.coverageAngle && (
            <div className="rounded-xl border border-cyan-500/25 bg-cyan-950/20 p-4">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Editorial Framing Analysis</span>
              </div>
              <p className="text-sm text-cyan-100/90 leading-relaxed">
                {article.coverageAngle}
              </p>
            </div>
          )}

          {/* Lead description & Full Content */}
          <div className="space-y-4 text-slate-200 text-sm md:text-base leading-relaxed">
            <p className="font-medium text-slate-100 text-base md:text-lg leading-relaxed border-l-2 border-cyan-400 pl-4">
              {article.description}
            </p>
            <div className="text-slate-300 space-y-3 pt-2">
              <p>{article.content}</p>
            </div>
          </div>

          {/* Key Quotes if present */}
          {article.keyQuotes && article.keyQuotes.length > 0 && (
            <div className="space-y-3 border-t border-white/[0.08] pt-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Quote className="h-3.5 w-3.5 text-cyan-400" />
                <span>Recorded Broadsheet Quotes</span>
              </h3>
              <div className="space-y-2">
                {article.keyQuotes.map((q, idx) => (
                  <blockquote
                    key={idx}
                    className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3 text-xs italic text-slate-300 leading-relaxed"
                  >
                    "{q}"
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <Tag className="h-3.5 w-3.5 text-slate-400 mr-1" />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-white/[0.04] px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-white/[0.06]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] bg-[#090d14] px-6 py-4">
          <button
            onClick={() => {
              onClose();
              onAskAi(article);
            }}
            className="inline-flex items-center space-x-2 rounded-lg bg-cyan-500/20 px-4 py-2 text-xs font-semibold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 hover:border-cyan-400 transition shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Ask NewsBot AI About This Story</span>
          </button>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition"
          >
            <span>Visit Original on {article.source}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
