import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { getPanelistInterviews } from "../../services/hiringWorkflowService";
import { getPanelistShortlists } from "../../services/panelistWorkflowService";

function PanelistDashboardPage() {
  const [interviews, setInterviews] = useState([]);
  const [shortlists, setShortlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
   let cancelled = false;

    async function loadInitialDashboard() {
      try {
        const [interviewData, shortlistData] = await Promise.all([
          getPanelistInterviews(),
          getPanelistShortlists(),
        ]);

        if (!cancelled) {
          setInterviews(
            Array.isArray(interviewData)
              ? interviewData
              : []
          );

          setShortlists(
            Array.isArray(shortlistData)
              ? shortlistData
              : []
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load dashboard details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  async function retryDashboard() {
    try {
      setLoading(true);
      setError("");

      const [interviewData, shortlistData] = await Promise.all([
        getPanelistInterviews(),
        getPanelistShortlists(),
      ]);

      setInterviews(
        Array.isArray(interviewData)
          ? interviewData
          : []
      );

      setShortlists(
        Array.isArray(shortlistData)
          ? shortlistData
          : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load dashboard details."
      );
    } finally {
      setLoading(false);
    }
  }



  const dashboardData = useMemo(() => {
    const now = new Date();

    const upcoming = interviews
      .filter((interview) => {
        if (!interview.scheduledAt) return false;

        const scheduledAt = new Date(interview.scheduledAt);

        return (
          scheduledAt > now &&
          interview.status !== "Cancelled"
        );
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledAt) -
          new Date(b.scheduledAt)
      );

    const feedbackSubmitted = interviews.filter(
      (interview) => Boolean(interview.feedback)
    ).length;

    return {
      upcomingCount: upcoming.length,
      feedbackSubmitted,
      assignedShortlists: shortlists.length,
      nextInterview: upcoming[0] ?? null,
    };
  }, [interviews, shortlists]);

  const stats = [
    {
      icon: CalendarClock,
      label: "Upcoming interviews",
      value: dashboardData.upcomingCount,
      to: "/panelist/interviews",
    },
    {
      icon: CheckCircle2,
      label: "Feedback submitted",
      value: dashboardData.feedbackSubmitted,
      to: "/panelist/interviews",
    },
    {
      icon: UsersRound,
      label: "Assigned shortlists",
      value: dashboardData.assignedShortlists,
      to: "/panelist/shortlists",
    },
  ];

  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-600">
        <Sparkles size={12} />
        HIRING PANELIST
      </div>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        Your interview schedule
      </h1>

      <p className="mt-2 text-neutral-500">
        Review candidates and submit structured feedback for your
        assigned interviews.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-6 flex max-w-4xl flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          <div className="flex items-center gap-2">
            <AlertCircle
              size={17}
              className="shrink-0"
            />

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={retryDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />

            {loading ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-neutral-500">
          <Loader2
            size={17}
            className="animate-spin"
          />
          Loading dashboard...
        </div>
      ) : (
        <>
          <div className="mt-8 grid max-w-4xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <Link
                key={stat.label}
                to={stat.to}
                className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 p-6 shadow-xl shadow-neutral-200/30 backdrop-blur-2xl transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
                    <stat.icon
                      size={20}
                      className="text-amber-600"
                    />
                  </div>

                  <ArrowUpRight
                    size={16}
                    className="text-neutral-300 transition group-hover:text-neutral-500"
                  />
                </div>

                <p className="mt-4 text-xs text-neutral-400">
                  {stat.label}
                </p>

                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-8 max-w-4xl rounded-2xl border border-white/70 bg-white/75 p-6 shadow-xl shadow-neutral-200/30 backdrop-blur-2xl">
            <h2 className="text-lg font-semibold tracking-tight">
              Next up
            </h2>

            {dashboardData.nextInterview ? (
              <div className="mt-3">
                <p className="text-sm font-semibold text-neutral-800">
                  {dashboardData.nextInterview.candidate}
                </p>

                <p className="mt-1 text-sm text-neutral-600">
                  {dashboardData.nextInterview.job}
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  {new Date(
                    dashboardData.nextInterview.scheduledAt
                  ).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">
                No upcoming interviews scheduled.
              </p>
            )}

            <Link
              to="/panelist/interviews"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 transition hover:text-amber-700"
            >
              View all interviews
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default PanelistDashboardPage;