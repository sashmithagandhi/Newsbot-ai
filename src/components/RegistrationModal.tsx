import React, { useState } from "react";
import { X, ShieldCheck, UserCheck, Sparkles, Check } from "lucide-react";
import { UserProfile } from "../types";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onRegister: (name: string, email: string, preferredSources: string[]) => Promise<void>;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onRegister,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [selectedSources, setSelectedSources] = useState<string[]>(
    currentUser?.preferredSources || ["The Hindu", "Times of India", "Indian Express", "NDTV"]
  );
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const sourcesList = [
    { name: "The Hindu", desc: "Policy, Constitutional Jurisprudence & Diplomacy" },
    { name: "Times of India", desc: "Metro Coverage, Commerce, Markets & Sports" },
    { name: "Indian Express", desc: "Explained Investigative Journalism & Governance" },
    { name: "NDTV", desc: "Ground Broadcast Telemetry & Tech Horizons" },
    { name: "NewsAPI Sources", desc: "Financial Wire (Mint, Business Standard, PTI)" },
  ];

  const toggleSource = (sName: string) => {
    if (selectedSources.includes(sName)) {
      setSelectedSources(selectedSources.filter((s) => s !== sName));
    } else {
      setSelectedSources([...selectedSources, sName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    setStatusMsg("");
    try {
      await onRegister(name.trim(), email.trim(), selectedSources);
      setStatusMsg("Identity verified. Welcome to NewsBot Intelligence.");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to register profile";
      setStatusMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.12] bg-[#0c1017] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-1 text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">NewsBot Identity Hub</h2>
            <p className="text-xs font-mono text-cyan-400">
              Welcome to your personal news intelligence system.
            </p>
          </div>
        </div>

        {currentUser && (
          <div className="mb-5 rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-3 flex items-center space-x-2.5 text-xs text-emerald-300">
            <UserCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Active identity: <strong>{currentUser.name}</strong> ({currentUser.email})
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
              Reader Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sashmitha Gandhi"
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:bg-cyan-950/20 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-1.5">
              Email Dispatch Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sashmithagandhi6@gmail.com"
              className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:bg-cyan-950/20 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-300 uppercase tracking-wider mb-2">
              Select Broadsheet Preferences
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {sourcesList.map((source) => {
                const isChecked = selectedSources.includes(source.name);
                return (
                  <div
                    key={source.name}
                    onClick={() => toggleSource(source.name)}
                    className={`flex items-start justify-between rounded-lg border p-2.5 cursor-pointer transition ${
                      isChecked
                        ? "border-cyan-500/40 bg-cyan-950/25 text-slate-100"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:border-white/[0.12]"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-200">{source.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{source.desc}</div>
                    </div>
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        isChecked
                          ? "border-cyan-400 bg-cyan-400 text-black"
                          : "border-slate-600 bg-transparent"
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {statusMsg && (
            <p className="text-xs font-mono text-cyan-300 py-1">{statusMsg}</p>
          )}

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              <span>Zero telemetry tracking</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-cyan-500 px-5 py-2 text-xs font-bold text-black shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:bg-cyan-400 transition disabled:opacity-50"
            >
              {loading ? "INITIALIZING..." : currentUser ? "UPDATE PROFILE" : "INITIALIZE ACCESS"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
