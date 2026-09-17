import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight, Briefcase, FileStack, Sparkles, Star, UserCheck, FileText, Target,
} from "lucide-react";
import { getDashboardStats } from "../../services/jobSeekerDashboardService";

function JobSeekerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getDashboardStats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const statCards = stats
    ? [
        {
          icon: FileStack,
          label: "Active applications",
          value: stats.activeApplications,
          to: "/jobs/applications",
        },
        {
          icon: Star,
          label: "Average match score",
          value: `${stats.averageMatchScore}%`,
          to: "/jobs/applications",
        },
        {
          icon: Briefcase,
          label: "Skills added",
          value: stats.skillsCount,
          to: "/jobs/profile",
        },
        {
          icon: Target,
          label: "Profile completeness",
          value: `${stats.profileCompleteness}%`,
          to: "/jobs/profile",
        },
        {
          icon: FileText,
          label: "CV status",
          value: stats.cvUploaded ? "Uploaded" : "Missing",
          to: "/jobs/profile",
        },
        {
          icon: UserCheck,
          label: "Total applications",
          value: stats.totalApplications,
          to: "/jobs/applications",
        },
      ]
    : [];

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

      {loading && (
        <p className="mt-8 text-sm text-neutral-400">Loading your stats...</p>
      )}

      {!loading && error && (
        <p className="mt-8 text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && (
        <>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {statCards.map((s) => (
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

          {stats.topGapSkills.length > 0 && (
            <div className="mt-8 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6">
              <h2 className="text-lg font-semibold tracking-tight">Skills worth adding</h2>
              <p className="mt-1 text-sm text-neutral-500">
                These show up most often as gaps across the jobs you've applied to.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {stats.topGapSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default JobSeekerDashboardPage;
