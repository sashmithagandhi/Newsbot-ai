import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Clock,
  Activity,
  Zap,
  RotateCcw
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { AnalyticsData } from "../types";
import { api } from "../services/api";

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Chart data formatting
  const sourceChartData = data
    ? Object.entries(data.sourceDistribution).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  const categoryChartData = data
    ? Object.entries(data.categoryDistribution).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  const sentimentChartData = data
    ? [
        { name: "Analytical", value: data.sentimentTelemetry.Analytical, color: "#38bdf8" },
        { name: "Positive", value: data.sentimentTelemetry.Positive, color: "#34d399" },
        { name: "Neutral", value: data.sentimentTelemetry.Neutral, color: "#94a3b8" },
        { name: "Critical", value: data.sentimentTelemetry.Critical, color: "#f87171" },
      ]
    : [];

  const COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#111724] to-[#0a0e15] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            <Activity className="h-4 w-4" />
            <span>Telemetry Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            News Intelligence Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1">
            Real-time pipeline diagnostics, newspaper ingestion volumes, vector latency, and AI synthesis load.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center space-x-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3.5 py-2 text-xs font-mono font-semibold text-cyan-300 hover:bg-cyan-900/40 transition shrink-0"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>REFRESH METRICS</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1017] p-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>TOTAL DISPATCHES</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
            {data ? data.totalArticlesIndexed : "—"}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1 flex items-center space-x-1">
            <span>+{data ? data.todayIndexedCount : 0} ingested today</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c1017] p-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>AI QUERIES SERVED</span>
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-300">
            {data ? data.totalAiQueriesAnswered : "—"}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Average Latency: {data ? `${data.avgResponseLatencyMs}ms` : "—"}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c1017] p-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>ACTIVE BROADSHEETS</span>
            <Cpu className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
            {data ? data.activeSourcesCount : "5"} Sources
          </div>
          <div className="text-[11px] font-mono text-cyan-400 mt-1">
            Status: 100% Online
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c1017] p-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>SYSTEM UPTIME</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
            {data ? data.systemUptime : "99.98%"}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 truncate">
            Sync: {data ? data.lastPipelineSync : "Live"}
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Ingestion & AI Query Telemetry */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100">7-Day Ingestion & Query Telemetry</h3>
              <p className="text-[11px] font-mono text-slate-400">Daily broadsheet items vs AI research requests</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {data ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyTelemetry}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d131d",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Dispatches Ingested"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4", r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="aiQueries"
                    name="AI Queries"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Source Distribution Breakdown */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Broadsheet Share of Coverage</h3>
              <p className="text-[11px] font-mono text-slate-400">Articles indexed across top Indian publications</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {sourceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    width={105}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d131d",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" name="Articles" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Topical Category Distribution</h3>
              <p className="text-[11px] font-mono text-slate-400">Classification of indexed national issues</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d131d",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        {/* Editorial Tone & Sentiment */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-100">Editorial Framing Sentiment</h3>
              <p className="text-[11px] font-mono text-slate-400">Tone index calculated across broadsheet leads</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around h-64">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentChartData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sentimentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d131d",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs font-mono">
              {sentimentChartData.map((s) => (
                <div key={s.name} className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                  <span className="text-slate-300 w-24">{s.name}:</span>
                  <span className="font-bold text-slate-100">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Compared Topics Table */}
      {data?.topComparedTopics && (
        <div className="rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-100">Top Compared National Topics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-white/[0.08] text-slate-400">
                <tr>
                  <th className="pb-2">TOPIC</th>
                  <th className="pb-2">RESEARCH QUERIES</th>
                  <th className="pb-2">CROSS-PAPER EDITORIAL CONSENSUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {data.topComparedTopics.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 font-semibold text-slate-100">{item.topic}</td>
                    <td className="py-2.5 text-cyan-400">{item.queries} queries</td>
                    <td className="py-2.5 text-slate-300">{item.consensus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
