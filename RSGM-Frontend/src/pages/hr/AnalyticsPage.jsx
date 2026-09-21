import { useEffect, useState } from "react";
import {
  AlertCircle,
  Clock,
  Loader2,
  Percent,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { getHrAnalytics } from "../../services/hiringWorkflowService";

const FUNNEL_COLORS = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-neutral-800",
];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getHrAnalytics()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-neutral-500">
        <Loader2 size={16} className="animate-spin" />
        Loading analytics…
      </div>
    );
  }

  const stats = data
    ? [
        {
          icon: Clock,
          label: "Avg. time to hire",
          value: data.avgTimeToHire > 0 ? `${data.avgTimeToHire} days` : "—",
          sub: "From application to acceptance",
        },
        {
          icon: Percent,
          label: "Offer acceptance rate",
          value: `${data.offerAcceptanceRate}%`,
          sub: "Accepted / decided offers",
        },
        {
          icon: Users,
          label: "Active candidates",
          value: data.activeCandidates,
          sub: "Currently in pipeline",
        },
        {
          icon: TrendingUp,
          label: "Requisition approval rate",
          value: `${data.requisitionApprovalRate}%`,
          sub: "Approved / decided requisitions",
        },
      ]
    : [];

  const funnel = data?.funnel ?? [];
  const maxCount = funnel.length > 0 ? Math.max(...funnel.map((f) => f.count), 1) : 1;

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        RECRUITMENT ANALYTICS
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Analytics</h1>
      <p className="mt-2 text-neutral-500">Key metrics across the hiring funnel for your company.</p>

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {!error && (
        <>
          {/* KPI Cards */}
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6"
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <s.icon size={20} className="text-emerald-600" />
                </div>
                <p className="mt-4 text-xs text-neutral-400">{s.label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="mt-1 text-xs text-neutral-400">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Hiring Funnel */}
          <div className="mt-8 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6">
            <h2 className="text-lg font-semibold tracking-tight">Hiring funnel</h2>

            {funnel.length === 0 ? (
              <p className="mt-6 text-sm text-neutral-400">No application data yet.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {funnel.map((f, i) => (
                  <div key={f.stage}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium text-neutral-700">{f.stage}</span>
                      <span className="text-neutral-400">{f.count}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${FUNNEL_COLORS[i] ?? "bg-neutral-400"}`}
                        style={{ width: `${(f.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}