import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ListChecks, ShieldCheck, Sparkles } from "lucide-react";

import { getSkills } from "../../services/skillService";
import { getCurrentUser } from "../../services/authService";

function AdminDashboardPage() {
  const user = getCurrentUser();
  const [totalSkills, setTotalSkills] = useState(null);
  const [activeSkills, setActiveSkills] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    getSkills()
      .then((skills) => {
        if (ignore) return;
        setTotalSkills(skills.length);
        setActiveSkills(skills.filter((s) => s.isActive).length);
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "Unable to load stats.");
      });
    return () => { ignore = true; };
  }, []);

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
        Manage the skill catalog that powers RSGM's skill-gap matching.
      </p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 grid sm:grid-cols-2 gap-5">
        <StatCard icon={ListChecks} label="Total skills" value={totalSkills} />
        <StatCard icon={ShieldCheck} label="Active skills" value={activeSkills} />
      </div>

      <Link
        to="/admin/skills"
        className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 active:scale-[0.99] transition"
      >
        Manage skills
        <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
          <Icon size={20} className="text-violet-600" />
        </div>
        <div>
          <p className="text-xs text-neutral-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value === null ? "—" : value}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;