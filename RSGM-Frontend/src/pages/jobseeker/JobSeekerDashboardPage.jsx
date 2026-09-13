import { Link } from "react-router-dom";
import {
  ArrowUpRight, Briefcase, FileStack, Sparkles, Star,
} from "lucide-react";

const STATS = [
  { icon: FileStack, label: "Active applications", value: 4, to: "/jobs/applications" },
  { icon: Briefcase, label: "Jobs matching your skills", value: 12, to: "/jobs/browse" },
  { icon: Star, label: "Best match score", value: "88%", to: "/jobs/applications" },
];

function JobSeekerDashboardPage() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        YOUR JOB SEARCH
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
        Welcome back
      </h1>

      <p className="mt-2 text-neutral-500">
        Keep your profile sharp and track how you're matching against open roles.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {STATS.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 hover:-translate-y-0.5 transition"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center">
                <s.icon size={20} className="text-violet-600" />
              </div>
              <ArrowUpRight size={16} className="text-neutral-300 group-hover:text-neutral-500 transition" />
            </div>
            <p className="mt-4 text-xs text-neutral-400">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6">
        <h2 className="text-lg font-semibold tracking-tight">Suggested next steps</h2>
        <ul className="mt-4 space-y-3 text-sm text-neutral-600">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            Add "TypeScript" to your skills — it appears in 3 of your saved jobs
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            Your CV was last updated 2 weeks ago
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            2 applications are awaiting recruiter review
          </li>
        </ul>
      </div>
    </div>
  );
}

export default JobSeekerDashboardPage;