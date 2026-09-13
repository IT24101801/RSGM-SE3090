import { Link } from "react-router-dom";
import {
  ArrowUpRight, BadgeCheck, ClipboardList, Sparkles, Workflow,
} from "lucide-react";

const STATS = [
  { icon: ClipboardList, label: "Requisitions awaiting approval", value: 4, to: "/hr/requisitions" },
  { icon: BadgeCheck, label: "Offers awaiting approval", value: 3, to: "/hr/offers" },
  { icon: Workflow, label: "Active workflows", value: 11, to: "/hr/workflows" },
];

function HRDashboardPage() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        HR MANAGER WORKSPACE
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
        Approvals & oversight
      </h1>

      <p className="mt-2 text-neutral-500">
        Review pending requisitions and offers, and keep an eye on recruitment health.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {STATS.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6 hover:-translate-y-0.5 transition"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <s.icon size={20} className="text-emerald-600" />
              </div>
              <ArrowUpRight size={16} className="text-neutral-300 group-hover:text-neutral-500 transition" />
            </div>
            <p className="mt-4 text-xs text-neutral-400">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6">
        <h2 className="text-lg font-semibold tracking-tight">Needs your attention</h2>
        <ul className="mt-4 space-y-3 text-sm text-neutral-600">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Requisition "Senior Frontend Engineer" pending your approval since Sep 10
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Offer to Marcus Tan (Product Designer) awaiting sign-off
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Candidate matching workflow for Backend Engineer flagged low completion rate
          </li>
        </ul>
      </div>
    </div>
  );
}

export default HRDashboardPage;