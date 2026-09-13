import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarClock, CheckCircle2, Sparkles } from "lucide-react";

const STATS = [
  { icon: CalendarClock, label: "Upcoming interviews", value: 3, to: "/panelist/interviews" },
  { icon: CheckCircle2, label: "Feedback submitted", value: 8, to: "/panelist/interviews" },
];

function PanelistDashboardPage() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        HIRING PANELIST
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
        Your interview schedule
      </h1>

      <p className="mt-2 text-neutral-500">
        Review candidates and submit structured feedback for your assigned interviews.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-5 max-w-xl">
        {STATS.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 hover:-translate-y-0.5 transition"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
                <s.icon size={20} className="text-amber-600" />
              </div>
              <ArrowUpRight size={16} className="text-neutral-300 group-hover:text-neutral-500 transition" />
            </div>
            <p className="mt-4 text-xs text-neutral-400">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 max-w-xl">
        <h2 className="text-lg font-semibold tracking-tight">Next up</h2>
        <p className="mt-3 text-sm text-neutral-600">
          Aisha Rahman · Senior Frontend Engineer — Tomorrow, 10:00 AM
        </p>
        <Link
          to="/panelist/interviews"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition"
        >
          View all interviews
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default PanelistDashboardPage;