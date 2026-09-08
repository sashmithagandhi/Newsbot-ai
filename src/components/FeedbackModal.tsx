import React, { useState } from "react";
import { X, Star, MessageSquare, Send } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feature: string, comment?: string) => Promise<void>;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feature, setFeature] = useState<string>("AI NewsBot");
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const features = [
    "AI NewsBot",
    "Newspaper Comparison",
    "News Intelligence Archive",
    "Home & Latest Dispatches",
    "Command Center Analytics",
    "Advertising Marketplace",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(rating, feature, comment);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#0c1017] p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-1 text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Reader Feedback</h2>
            <p className="text-xs font-mono text-slate-400">Help tune NewsBot's intelligence engine</p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-2">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Telemetry Recorded</h3>
            <p className="text-xs text-slate-400">Thank you for helping refine our newspaper research model.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star rating */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-2">
                Overall Experience Rating
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-600 transition hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-600"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-mono text-cyan-400 font-bold">
                  {rating}/5 Stars
                </span>
              </div>
            </div>

            {/* Feature used */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Feature Utilized
              </label>
              <select
                value={feature}
                onChange={(e) => setFeature(e.target.value)}
                className="w-full rounded-lg border border-white/[0.1] bg-[#111722] px-3.5 py-2.5 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
              >
                {features.map((f) => (
                  <option key={f} value={f} className="bg-[#0f141d] text-slate-200">
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Feedback & Observations (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on article retrieval, newspaper comparison nuance, or interface speed..."
                className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-1.5 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-bold text-black shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-400 transition disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{loading ? "TRANSMITTING..." : "SUBMIT TELEMETRY"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
