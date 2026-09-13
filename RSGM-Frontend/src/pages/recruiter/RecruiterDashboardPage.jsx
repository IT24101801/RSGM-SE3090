import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Briefcase,
  CalendarClock,
  FileStack,
  ListTree,
  Sparkles,
} from "lucide-react";

const STATS = [
  { icon: ListTree, label: "Open requisitions", value: 6, to: "/recruiter/requisitions" },
  { icon: Briefcase, label: "Live job postings", value: 9, to: "/recruiter/postings" },
  { icon: FileStack, label: "New applications", value: 24, to: "/recruiter/applications" },
  { icon: CalendarClock, label: "Interviews this week", value: 5, to: "/recruiter/interviews" },
];

function RecruiterDashboardPage() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        RECRUITER WORKSPACE
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
        Your hiring at a glance
      </h1>

      <p className="mt-2 text-neutral-500">
        Track requisitions, postings, applications, and interviews in one place.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 hover:-translate-y-0.5 transition"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                <s.icon size={20} className="text-blue-600" />
              </div>
              <ArrowUpRight size={16} className="text-neutral-300 group-hover:text-neutral-500 transition" />
            </div>
            <p className="mt-4 text-xs text-neutral-400">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6">
          <h2 className="text-lg font-semibold tracking-tight">Next steps</h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Review 24 new applications for Senior Frontend Engineer
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Run candidate matching for Product Designer requisition
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Finalize shortlist for Data Analyst role before Friday
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6">
          <h2 className="text-lg font-semibold tracking-tight">Upcoming interviews</h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-600">
            <li className="flex items-center justify-between">
              <span>Aisha Rahman · Frontend Engineer</span>
              <span className="text-neutral-400">Tomorrow, 10:00 AM</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Marcus Tan · Product Designer</span>
              <span className="text-neutral-400">Wed, 2:30 PM</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RecruiterDashboardPage;