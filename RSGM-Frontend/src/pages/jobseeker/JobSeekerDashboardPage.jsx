import { useEffect, useState } from "react";

import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  getJobSeekerDashboard,
} from "../../services/jobSeekerDashboardService";

function JobSeekerDashboardPage() {
  const [dashboard, setDashboard] = useState({
    fullName: "",
    profileCompleteness: 0,
    totalApplications: 0,
    activeApplications: 0,
    shortlistedApplications: 0,
    availableJobs: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getJobSeekerDashboard();

      setDashboard({
        fullName:
          data.fullName ?? "",
        profileCompleteness:
          data.profileCompleteness ?? 0,
        totalApplications:
          data.totalApplications ?? 0,
        activeApplications:
          data.activeApplications ?? 0,
        shortlistedApplications:
          data.shortlistedApplications ?? 0,
        availableJobs:
          data.availableJobs ?? 0,
      });
    } catch (err) {
      setError(
        err.message ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      label: "Available Jobs",
      value: dashboard.availableJobs,
      icon: BriefcaseBusiness,
    },
    {
      label: "Applications",
      value: dashboard.totalApplications,
      icon: FileText,
    },
    {
      label: "Active Applications",
      value: dashboard.activeApplications,
      icon: CheckCircle2,
    },
    {
      label: "Shortlisted",
      value:
        dashboard.shortlistedApplications,
      icon: Sparkles,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Loader2
          size={18}
          className="animate-spin"
        />

        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}

      <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-600">
        <Sparkles size={12} />
        JOB SEEKER DASHBOARD
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        Welcome
        {dashboard.fullName
          ? `, ${dashboard.fullName}`
          : ""}
      </h1>

      <p className="mt-2 text-neutral-500">
        Track your profile, applications,
        and available job opportunities.
      </p>

      {/* ERROR */}

      {error && (
        <div className="mt-5 flex max-w-lg items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle
            size={17}
            className="mt-0.5 shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      {/* PROFILE COMPLETION */}

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
              <UserRound
                size={20}
                className="text-violet-600"
              />
            </div>

            <div>
              <h2 className="font-semibold">
                Profile Completion
              </h2>

              <p className="text-sm text-neutral-500">
                Complete your profile to improve
                your job opportunities.
              </p>
            </div>
          </div>

          <span className="text-lg font-semibold">
            {dashboard.profileCompleteness}%
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-violet-600 transition-all"
            style={{
              width: `${Math.min(
                Math.max(
                  dashboard.profileCompleteness,
                  0
                ),
                100
              )}%`,
}}
          />
        </div>
      </section>

      {/* STATISTICS */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-500">
                    {card.label}
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {card.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100">
                  <Icon
                    size={20}
                    className="text-neutral-700"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default JobSeekerDashboardPage;