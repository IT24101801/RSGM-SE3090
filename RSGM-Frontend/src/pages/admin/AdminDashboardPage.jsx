import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Ban,
  BriefcaseBusiness,
  CircleCheck,
  FileText,
  ListChecks,
  Loader2,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";

import { getCurrentUser } from "../../services/authService";
import { getAdminDashboardStats } from "../../services/adminDashboardService";

const EMPTY_STATS = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  newUsersLast30Days: 0,
  totalSkills: 0,
  activeSkills: 0,
  totalJobPostings: 0,
  publishedJobPostings: 0,
  totalApplications: 0,
};

function AdminDashboardPage() {
  const user = getCurrentUser();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    getAdminDashboardStats()
      .then((data) => {
        if (!ignore) setStats(data);
      })
      .catch((requestError) => {
        if (!ignore) {
          setError(requestError.message || "Unable to load dashboard statistics.");
        }
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const cards = [
    { icon: Users, label: "Total users", value: stats.totalUsers, color: "violet" },
    { icon: CircleCheck, label: "Active users", value: stats.activeUsers, color: "emerald" },
    { icon: Ban, label: "Inactive users", value: stats.inactiveUsers, color: "red" },
    { icon: UserPlus, label: "New users (30 days)", value: stats.newUsersLast30Days, color: "blue" },
    { icon: BriefcaseBusiness, label: "Total job postings", value: stats.totalJobPostings, color: "amber" },
    { icon: FileText, label: "Published jobs", value: stats.publishedJobPostings, color: "cyan" },
    { icon: FileText, label: "Job applications", value: stats.totalApplications, color: "indigo" },
    { icon: ListChecks, label: "Active skills", value: `${stats.activeSkills} / ${stats.totalSkills}`, color: "violet" },
  ];

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        ADMIN CONSOLE
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
        Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
      </h1>

      <p className="mt-2 text-neutral-500">
        Monitor users, recruitment activity, job postings, applications, and skills.
      </p>

      {error && (
        <div className="mt-5 flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600 max-w-2xl">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="mt-10 flex items-center gap-2 text-sm text-neutral-400">
          <Loader2 size={17} className="animate-spin" />
          Loading system statistics...
        </div>
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 active:scale-[0.99] transition"
        >
          Manage users
          <ArrowUpRight size={16} />
        </Link>

        <Link
          to="/admin/skills"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-sm font-semibold hover:bg-neutral-50 active:scale-[0.99] transition"
        >
          Manage skills
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}

const COLOR_STYLES = {
  violet: "bg-violet-100 text-violet-600",
  emerald: "bg-emerald-100 text-emerald-600",
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-blue-600",
  amber: "bg-amber-100 text-amber-600",
  cyan: "bg-cyan-100 text-cyan-600",
  indigo: "bg-indigo-100 text-indigo-600",
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${COLOR_STYLES[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs text-neutral-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
