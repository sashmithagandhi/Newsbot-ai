import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  ExternalLink,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  Filter,
  ShieldAlert,
  ArrowRight,
  Clock,
  Radio,
  Copy,
  Check
} from "lucide-react";
import { ChatMessage, ChatResponse, Article } from "../types";
import { api } from "../services/api";
import { AiCoreVisualizer } from "../components/AiCoreVisualizer";
import { SourceBadge } from "../components/SourceBadge";

interface AiChatViewProps {
  initialQuery?: string;
  initialArticle?: Article | null;
  onClearInitial?: () => void;
  onSelectArticle: (article: Article) => void;
}

export const AiChatView: React.FC<AiChatViewProps> = ({
  initialQuery,
  initialArticle,
  onClearInitial,
  onSelectArticle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      role: "assistant",
      content: `Welcome to the **NewsBot Intelligence Terminal**.\n\nI am your dedicated AI newspaper research assistant for Indian readers. I continuously synthesize and cross-verify reports from **The Hindu**, **Times of India**, **Indian Express**, and **NDTV**.\n\nAsk me any question about today's headlines, policy changes, legal developments, or compare how different newsrooms reported on a specific issue.`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What happened in today's Indian politics?",
    "Summarize today's major economic news.",
    "What are today's biggest technology stories?",
    "What did The Hindu report about this?",
    "Compare today's coverage of Union Budget",
    "What are the important headlines I should know today?",
  ];

  const sourceFilterOptions = [
    { label: "All Broadsheets", value: "all" },
    { label: "The Hindu", value: "the-hindu" },
    { label: "Times of India", value: "times-of-india" },
    { label: "Indian Express", value: "indian-express" },
    { label: "NDTV", value: "ndtv" },
  ];

  // Handle pre-loaded query or article
  useEffect(() => {
    if (initialArticle) {
      const q = `Analyze this story from ${initialArticle.source}: "${initialArticle.headline}". Provide context, editorial perspective, and key implications.`;
      handleSendMessage(q);
      if (onClearInitial) onClearInitial();
    } else if (initialQuery) {
      handleSendMessage(initialQuery);
      if (onClearInitial) onClearInitial();
    }
  }, [initialQuery, initialArticle]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, processingStage]);

  // Stop speech if unmounting
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputPrompt;
    if (!textToSend.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsProcessing(true);

    // Simulated progressive UI stages corresponding to real request phases
    setProcessingStage("Scanning today's news...");
    const timer1 = setTimeout(() => {
      setProcessingStage("Retrieving relevant coverage across broadsheets...");
    }, 600);
    const timer2 = setTimeout(() => {
      setProcessingStage("Cross-checking sources and editorial angles...");
    }, 1200);

    try {
      const response: ChatResponse = await api.sendChatMessage(
        textToSend.trim(),
        sourceFilter !== "all" ? sourceFilter : undefined
      );

      clearTimeout(timer1);
      clearTimeout(timer2);
      setProcessingStage("");

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        timestamp: response.timestamp,
        sources: response.sources,
        citedArticles: response.cited_articles,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setProcessingStage("");
      const errorMessage = err instanceof Error ? err.message : "Failed to query NewsBot AI";

      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `**Telemetry Alert:** ${errorMessage}. Please verify network connection or select a different newspaper filter.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReadAloud = (text: string) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown symbols for cleaner audio
    const cleanText = text
      .replace(/[#*`_>]/g, "")
      .replace(/\[.*?\]/g, "")
      .slice(0, 1000); // Read first portion

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "msg-init",
        role: "assistant",
        content: `Session reset. Memory re-indexed with today's Indian broadsheets.\n\nAsk anything about today's news.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[620px] rounded-2xl border border-white/[0.1] bg-[#0c1017] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)]">
      {/* Top AI Terminal Command Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-[#090d14] px-4 sm:px-6 py-3 gap-3">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="h-4 w-4" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-['Cinzel'] font-bold text-sm tracking-wider text-slate-100">
                AI NEWSBOT WORKSPACE
              </h2>
              <span className="rounded bg-cyan-500/15 px-1.5 py-0.2 font-mono text-[9px] font-bold text-cyan-400 border border-cyan-500/25">
                NEURAL RETRIEVAL
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Cross-verified with The Hindu, TOI, Indian Express, NDTV
            </p>
          </div>
        </div>

        {/* Source Scope Filter & Reset */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-slate-300">
            <Filter className="h-3 w-3 text-cyan-400" />
            <span>Scope:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-transparent text-cyan-300 font-medium focus:outline-none cursor-pointer"
            >
              {sourceFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0f141d] text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-slate-400 hover:text-slate-200 hover:border-white/[0.15] transition"
            title="Reset conversation"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
            >
              {/* Message Meta */}
              <div className="mb-1.5 flex items-center space-x-2 text-[10px] font-mono text-slate-500">
                {isAssistant ? (
                  <>
                    <span className="text-cyan-400 font-bold">NEWSBOT AI DISPATCH</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </>
                ) : (
                  <>
                    <span>READER INQUIRY</span>
                    <span>•</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </>
                )}
              </div>

              {/* Message Bubble Card */}
              <div
                className={`relative max-w-3xl rounded-2xl p-4 sm:p-5 transition-all ${
                  isAssistant
                    ? "border border-white/[0.08] bg-[#0e141e] text-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                    : "border border-cyan-500/30 bg-cyan-950/40 text-cyan-100 font-medium shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                }`}
              >
                {/* Content formatting */}
                <div className="prose prose-invert prose-sm max-w-none space-y-3 leading-relaxed">
                  {msg.content.split("\n\n").map((para, pIdx) => {
                    // Check if headline or markdown section
                    if (para.startsWith("### ")) {
                      return (
                        <h4 key={pIdx} className="text-base font-bold text-cyan-300 pt-1">
                          {para.replace("### ", "")}
                        </h4>
                      );
                    }
                    if (para.startsWith("> ")) {
                      return (
                        <blockquote
                          key={pIdx}
                          className="rounded-lg border-l-2 border-cyan-400 bg-cyan-950/20 px-3 py-2 text-xs italic text-cyan-200"
                        >
                          {para.replace("> ", "")}
                        </blockquote>
                      );
                    }
                    return (
                      <p key={pIdx} className="text-slate-200 text-sm whitespace-pre-line leading-relaxed">
                        {para}
                      </p>
                    );
                  })}
                </div>

                {/* Source Citations Box */}
                {isAssistant && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/[0.08]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-cyan-400">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>VERIFIED BROADSHEET CITATIONS</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        Confidence: 96.4%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          className="group/src rounded-lg border border-white/[0.06] bg-black/40 p-2.5 transition hover:border-cyan-500/30 hover:bg-cyan-950/20"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                            <SourceBadge source={src.newspaper} size="sm" />
                            <span className="text-cyan-400/80">{src.relevance}% Match</span>
                          </div>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs font-medium text-slate-300 group-hover/src:text-cyan-200 transition line-clamp-2"
                          >
                            {src.headline}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cited Articles Quick Cards */}
                {isAssistant && msg.citedArticles && msg.citedArticles.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 text-xs font-mono text-slate-400">
                    <span className="text-[11px] text-slate-500">Jump to Full Story:</span>
                    {msg.citedArticles.map((art) => (
                      <button
                        key={art.id}
                        onClick={() => onSelectArticle(art)}
                        className="inline-flex items-center space-x-1 rounded bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-300 hover:text-cyan-300 hover:bg-cyan-950/40 border border-white/[0.08] transition"
                      >
                        <span>{art.source}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Message controls for AI */}
                {isAssistant && msg.id !== "msg-init" && (
                  <div className="mt-3 flex items-center justify-end space-x-2 pt-2 text-xs text-slate-500">
                    <button
                      onClick={() => handleReadAloud(msg.content)}
                      className="flex items-center space-x-1 rounded p-1 hover:text-cyan-300 transition"
                      title="Audio speech synthesis"
                    >
                      {isSpeaking ? (
                        <VolumeX className="h-3.5 w-3.5 text-rose-400" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" />
                      )}
                      <span className="text-[10px] font-mono">
                        {isSpeaking ? "Mute" : "Voice Readout"}
                      </span>
                    </button>

                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="flex items-center space-x-1 rounded p-1 hover:text-cyan-300 transition"
                      title="Copy dispatch text"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span className="text-[10px] font-mono">
                        {copiedId === msg.id ? "Copied" : "Copy"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Processing / Thinking State */}
        {isProcessing && (
          <div className="flex flex-col items-start space-y-2">
            <div className="rounded-2xl border border-cyan-500/30 bg-[#0e141e] p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5">
              <AiCoreVisualizer
                isProcessing={true}
                stageText={processingStage || "Analyzing today's newspapers..."}
                size="md"
              />
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-mono text-xs font-bold text-cyan-300 tracking-wider uppercase">
                  News Intelligence Ingestion Active
                </div>
                <p className="text-xs text-slate-400 max-w-sm">
                  Querying vector embeddings across The Hindu, Times of India, Indian Express, and NDTV morning editions...
                </p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="border-t border-white/[0.06] bg-[#090d14] px-4 py-2">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[10px] font-mono text-slate-500 shrink-0">Quick Prompts:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isProcessing}
              className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-slate-300 hover:border-cyan-500/40 hover:bg-cyan-950/30 hover:text-cyan-200 transition disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box Footer */}
      <div className="border-t border-white/[0.08] bg-[#0c1017] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2.5 rounded-xl border border-white/[0.1] bg-[#101622] p-2 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isProcessing}
            placeholder="Ask anything about today's Indian news, headlines, policy, or compare perspectives..."
            className="flex-1 bg-transparent px-3 py-1 text-sm text-slate-100 placeholder-slate-400 focus:outline-none disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isProcessing}
            className="inline-flex h-9 items-center justify-center space-x-1.5 rounded-lg bg-cyan-500 px-4 text-xs font-bold text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:bg-cyan-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>SEND</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
