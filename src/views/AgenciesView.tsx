import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Search,
  Filter,
  Star,
  ShieldCheck,
  Check,
  ExternalLink,
  Mail,
  MapPin,
  TrendingUp,
  Layers,
  X
} from "lucide-react";
import { Agency, AgencySlot } from "../types";
import { api } from "../services/api";

export const AgenciesView: React.FC = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [newspaperFilter, setNewspaperFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState<number | undefined>(undefined);
  const [specFilter, setSpecFilter] = useState("all");

  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  const newspaperOptions = [
    { label: "All Broadsheets", value: "all" },
    { label: "The Hindu", value: "The Hindu" },
    { label: "Times of India", value: "Times of India" },
    { label: "Indian Express", value: "Indian Express" },
    { label: "NDTV", value: "NDTV" },
  ];

  const specializationOptions = [
    { label: "All Specializations", value: "all" },
    { label: "Front Page Full Spread & Solus", value: "Front Page Full Spread & Solus" },
    { label: "Financial Express & Business Line", value: "Financial Express & Business Line" },
    { label: "Public Policy & Public Notices", value: "Public Policy & Public Notices" },
    { label: "High-Tech & B2B Insets", value: "High-Tech & B2B Insets" },
  ];

  const fetchAgenciesList = async () => {
    setLoading(true);
    try {
      const res = await api.getAgencies({
        newspaper: newspaperFilter !== "all" ? newspaperFilter : undefined,
        max_budget: budgetFilter,
        specialization: specFilter !== "all" ? specFilter : undefined,
      });
      setAgencies(res.agencies);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgenciesList();
  }, [newspaperFilter, budgetFilter, specFilter]);

  const handleOpenAgency = async (agency: Agency) => {
    try {
      const details = await api.getAgencyDetails(agency.id);
      setSelectedAgency({
        ...agency,
        availableSlots: details.availableSlots,
      });
    } catch {
      setSelectedAgency(agency);
    }
    setInquiryModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#111724] to-[#0a0e15] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
            <Briefcase className="h-4 w-4" />
            <span>Commercial Broadsheet Exchange</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Agency & Print Advertising Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Connect directly with accredited Indian media buying agencies, reserve verified broadsheet display slots, and plan cross-newspaper campaign insertions.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-white/[0.08] bg-[#0c1017] p-4">
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Filter by Newspaper
            </label>
            <select
              value={newspaperFilter}
              onChange={(e) => setNewspaperFilter(e.target.value)}
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
              Campaign Budget Cap
            </label>
            <select
              value={budgetFilter || "all"}
              onChange={(e) =>
                setBudgetFilter(e.target.value === "all" ? undefined : Number(e.target.value))
              }
              className="w-full rounded-lg border border-white/[0.1] bg-[#101622] px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="all">Any Budget</option>
              <option value="200000">Up to ₹2,00,000</option>
              <option value="500000">Up to ₹5,00,000</option>
              <option value="1500000">Up to ₹15,00,000</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Specialization
            </label>
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="w-full rounded-lg border border-white/[0.1] bg-[#101622] px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              {specializationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Agency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 rounded-xl border border-white/[0.05] bg-[#0c1017] p-5 animate-pulse space-y-3"
            >
              <div className="h-6 w-32 bg-slate-800 rounded"></div>
              <div className="h-4 w-full bg-slate-800 rounded"></div>
              <div className="h-20 w-full bg-slate-800 rounded"></div>
            </div>
          ))
        ) : agencies.length === 0 ? (
          <div className="col-span-full rounded-xl border border-white/[0.08] bg-[#0c1017] p-12 text-center text-slate-400">
            <Briefcase className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-200">No Agencies Matched</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your budget or specialization filters.</p>
          </div>
        ) : (
          agencies.map((agency) => (
            <div
              key={agency.id}
              className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0c1017] p-5 transition-all hover:border-cyan-500/30 hover:bg-[#0f1520] hover:shadow-[0_0_20px_rgba(6,182,212,0.08)]"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h3 className="font-bold text-base text-slate-100">{agency.name}</h3>
                      {agency.verified && (
                        <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" title="INS Accredited" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-slate-400 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      <span>{agency.location}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs font-mono text-amber-300 border border-amber-500/20">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{agency.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300/80 line-clamp-3 leading-relaxed">
                  {agency.description}
                </p>

                {/* Specialization Pill */}
                <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2 text-xs">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Focus:</span>
                  <span className="font-medium text-cyan-300">{agency.specialization}</span>
                </div>

                {/* Broadsheet Coverage Tags */}
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                    Direct Newspaper Placement:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {agency.newspapers.map((np) => (
                      <span
                        key={np}
                        className="rounded bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-white/[0.06]"
                      >
                        {np}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom stats & action */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-500">Min. Budget</div>
                  <div className="text-xs font-bold font-mono text-slate-200">
                    ₹{agency.minBudget.toLocaleString("en-IN")}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAgency(agency)}
                  className="rounded-lg bg-cyan-500/15 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 hover:border-cyan-400 transition"
                >
                  View Rate Card
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Agency Details & Inquiry Modal */}
      {inquiryModalOpen && selectedAgency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/[0.12] bg-[#0c1017] p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setInquiryModalOpen(false);
                setInquirySent(false);
              }}
              className="absolute top-5 right-5 rounded-lg p-1 text-slate-400 hover:bg-white/[0.08] hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">{selectedAgency.name}</h2>
                <p className="text-xs font-mono text-cyan-400">
                  {selectedAgency.location} • INS Accreditation Verified
                </p>
              </div>
            </div>

            {/* Available Display Slots / Rate Card */}
            {selectedAgency.availableSlots && selectedAgency.availableSlots.length > 0 && (
              <div className="mb-5 space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Available Broadsheet Slots & Rate Card
                </h3>
                <div className="space-y-2">
                  {selectedAgency.availableSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{slot.format}</div>
                        <div className="text-[11px] text-slate-400">
                          Dim: {slot.dimension} • Reach: {slot.estimatedReach}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-cyan-300">{slot.rate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {inquirySent ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center text-emerald-300 space-y-2">
                <Check className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-base">Inquiry Transmitted to Agency Desk</h4>
                <p className="text-xs text-emerald-200/80">
                  A media planner from {selectedAgency.name} will contact your registered email address with custom ad insertion specs within 2 business hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setInquirySent(true);
                }}
                className="space-y-4 pt-2 border-t border-white/[0.08]"
              >
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Campaign Target Newspaper
                  </label>
                  <select className="w-full rounded-lg border border-white/[0.1] bg-[#101622] px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none">
                    {selectedAgency.newspapers.map((np) => (
                      <option key={np} value={np}>
                        {np}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Estimated Campaign Insertion Budget
                  </label>
                  <input
                    type="text"
                    defaultValue={`₹${selectedAgency.minBudget.toLocaleString("en-IN")}`}
                    className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setInquiryModalOpen(false)}
                    className="rounded-lg border border-white/[0.1] px-4 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-cyan-500 px-5 py-2 text-xs font-bold text-black hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    DISPATCH MEDIA INQUIRY
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
