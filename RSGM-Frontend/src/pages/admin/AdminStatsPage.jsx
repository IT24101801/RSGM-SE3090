import {
  Activity, BriefcaseBusiness, ListChecks, Sparkles, TrendingUp, Users,
} from "lucide-react";

// TODO: replace with GET /api/admin/stats
const STATS = [
  { icon: Users, label: "Total users", value: "1,284", trend: "+42 this week" },
  { icon: BriefcaseBusiness, label: "Active job postings", value: "96", trend: "+8 this week" },
  { icon: ListChecks, label: "Skills in catalog", value: "312", trend: "+5 this week" },
  { icon: Activity, label: "AI workflows run (24h)", value: "1,940", trend: "97.2% success rate" },
];

const ROLE_BREAKDOWN = [
  { role: "JobSeeker", count: 940, color: "bg-violet-500" },
  { role: "Recruiter", count: 210, color: "bg-blue-500" },
  { role: "HRManager", count: 88, color: "bg-cyan-500" },
  { role: "HiringPanelist", count: 40, color: "bg-emerald-500" },
  { role: "SystemAdmin", count: 6, color: "bg-neutral-800" },
];

const totalUsers = ROLE_BREAKDOWN.reduce((sum, r) => sum + r.count, 0);

function AdminStatsPage() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        SYSTEM OVERVIEW
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Statistics</h1>
      <p className="mt-2 text-neutral-500">
        A snapshot of platform activity and health.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6"
          >
            <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center">
              <s.icon size={20} className="text-violet-600" />
            </div>
            <p className="mt-4 text-xs text-neutral-400">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <TrendingUp size={12} />
              {s.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6">
        <h2 className="text-lg font-semibold tracking-tight">Users by role</h2>

        <div className="mt-5 space-y-4">
          {ROLE_BREAKDOWN.map((r) => (
            <div key={r.role}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-neutral-700">{r.role}</span>
                <span className="text-neutral-400">{r.count}</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${r.color}`}
                  style={{ width: `${(r.count / totalUsers) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminStatsPage;