import React from "react";
import { X, Bell, CheckCheck, RefreshCw, ArrowRight, Radio } from "lucide-react";
import { AlertItem } from "../types";

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertItem[];
  onMarkAsRead: (alertId: string) => void;
  onMarkAllAsRead: () => void;
  onTriggerFetchNow: () => void;
  isFetchingNow: boolean;
  onNavigateTo: (path: string) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onMarkAsRead,
  onMarkAllAsRead,
  onTriggerFetchNow,
  isFetchingNow,
  onNavigateTo,
}) => {
  if (!isOpen) return null;

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }) + " IST";
    } catch {
      return "Just now";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-white/[0.1] bg-[#0c1017] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#080c12] px-6 py-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Notification Center</h2>
              <p className="text-[11px] font-mono text-slate-400">
                NewsBot Real-time Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action toolbar */}
        <div className="flex items-center justify-between border-b border-white/[0.04] bg-[#0a0e15] px-6 py-2.5 text-xs font-mono">
          <button
            onClick={onTriggerFetchNow}
            disabled={isFetchingNow}
            className="flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetchingNow ? "animate-spin" : ""}`} />
            <span>{isFetchingNow ? "INGESTING EDITIONS..." : "FETCH LATEST EDITIONS"}</span>
          </button>

          <button
            onClick={onMarkAllAsRead}
            className="flex items-center space-x-1 text-slate-400 hover:text-slate-200 transition"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>

        {/* Alerts list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
              <Bell className="h-10 w-10 text-slate-600 mb-2 opacity-40" />
              <p className="text-sm font-medium">No Alerts Recorded</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                Trigger 'Fetch Now' to ingest fresh morning newspaper editions.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`relative rounded-xl border p-4 transition-all duration-200 ${
                  alert.read
                    ? "border-white/[0.05] bg-white/[0.01] text-slate-400 opacity-75"
                    : "border-cyan-500/30 bg-cyan-950/20 text-slate-200 shadow-[0_0_15px_rgba(6,182,212,0.06)]"
                }`}
              >
                {!alert.read && (
                  <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                )}

                <div className="flex items-center space-x-2 text-[10px] font-mono mb-1.5">
                  <Radio className="h-3 w-3 text-cyan-400" />
                  <span className="uppercase text-cyan-400/90 font-bold">[{alert.type}]</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{formatTimestamp(alert.timestamp)}</span>
                </div>

                <h3 className="font-semibold text-sm text-slate-100 pr-4 leading-snug">
                  {alert.title}
                </h3>

                <p className="mt-1 text-xs text-slate-300/80 leading-relaxed">
                  {alert.message}
                </p>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/[0.05]">
                  {alert.actionUrl && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTo(alert.actionUrl || "news");
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                    >
                      <span>View Dispatch</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}

                  {!alert.read && (
                    <button
                      onClick={() => onMarkAsRead(alert.id)}
                      className="text-[11px] font-mono text-slate-400 hover:text-slate-200"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
