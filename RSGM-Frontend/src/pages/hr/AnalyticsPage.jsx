import {
  Clock, Percent, Sparkles, TrendingUp, Users,
} from "lucide-react";

// TODO: replace with GET /api/hr/analytics
const STATS = [
  { icon: Clock, label: "Avg. time to hire", value: "27 days", trend: "-3 days vs last quarter" },
  { icon: Percent, label: "Offer acceptance rate", value: "84%", trend: "+6% vs last quarter" },
  { icon: Users, label: "Candidates in pipeline", value: 142, trend: "+18 this month" },
  { icon: TrendingUp, label: "Requisition approval rate", value: "91%", trend: "+2% vs last quarter" },
];

const FUNNEL = [
  { stage: "Applications", count: 480, color: "bg-emerald-500" },
  { stage: "Under Review", count: 210, color: "bg-teal-500" },
  { stage: "Shortlisted", count: 96, color: "bg-cyan-500" },
  { stage: "Interviewed", count: 54, color: "bg-blue-500" },
  { stage: "Offered", count: 22, color: "bg-violet-500" },
  { stage: "Hired", count: 18, color: "bg-neutral-800" },
];

const maxCount = Math.max(...FUNNEL.map((f) => f.count));

function AnalyticsPage() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        RECRUITMENT ANALYTICS
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Analytics</h1>
      <p className="mt-2 text-neutral-500">
        Key metrics across the hiring funnel this quarter.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <s.icon size={20} className="text-emerald-600" />
            </div>
            <p className="mt-4 text-xs text-neutral-400">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
            <p className="mt-2 text-xs text-emerald-600 font-medium">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6">
        <h2 className="text-lg font-semibold tracking-tight">Hiring funnel</h2>

        <div className="mt-6 space-y-4">
          {FUNNEL.map((f) => (
            <div key={f.stage}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-neutral-700">{f.stage}</span>
                <span className="text-neutral-400">{f.count}</span>
              </div>
              <div className="h-2.5 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${f.color}`}
                  style={{ width: `${(f.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;