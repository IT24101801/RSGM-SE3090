import { useCallback, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Loader2,
  MapPin,
  MonitorSmartphone,
  RefreshCw,
  UserRound,
} from "lucide-react";
import {
  confirmInterview,
  getCandidateInterviews,
  requestNewTime,
} from "../../services/panelistWorkflowService";

const statusStyles = {
  Proposed: "bg-amber-50 text-amber-700 ring-amber-100",
  Scheduled: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  RescheduleRequested: "bg-violet-50 text-violet-700 ring-violet-100",
  Cancelled: "bg-red-50 text-red-700 ring-red-100",
};

function readable(value) {
  if (!value) return "Not specified";
  return value.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function CompanyLogo({ name, logoUrl }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${name || "Company"} logo`}
        className="h-14 w-14 shrink-0 rounded-2xl border border-neutral-200 bg-white object-contain p-1.5"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
      <Building2 size={24} />
    </div>
  );
}

export default function MyInterviewsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const refresh = useCallback(async () => {
    setError("");
    try {
      setRows(await getCandidateInterviews());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function act(id, action) {
    setBusyId(id);
    setError("");
    try {
      await action();
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Your applications</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">My interviews</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Review interview details, confirm proposed sessions, or request another time.
      </p>

      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-7 space-y-4">
        {loading && (
          <p className="flex items-center gap-2 text-sm text-neutral-500">
            <Loader2 className="animate-spin" size={16} /> Loading interviews...
          </p>
        )}

        {!loading && rows.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
            No interviews yet.
          </div>
        )}

        {rows.map((interview) => {
          const scheduledAt = new Date(interview.scheduledAt);
          const canChange =
            scheduledAt > new Date() && ["Proposed", "Scheduled"].includes(interview.status);

          return (
            <article
              key={interview.id}
              className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-4">
                  <CompanyLogo name={interview.company} logoUrl={interview.companyLogoUrl} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-neutral-900">{interview.job}</h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[interview.status] || "bg-neutral-50 text-neutral-600 ring-neutral-200"}`}
                      >
                        {readable(interview.status)}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-neutral-600">
                      <Building2 size={14} /> {interview.company || "Company not specified"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-800 ring-1 ring-violet-100 lg:min-w-65">
                  <div className="flex items-center gap-2 font-semibold">
                    <CalendarClock size={17} /> Interview schedule
                  </div>
                  <div className="mt-2 font-medium">{scheduledAt.toLocaleDateString()}</div>
                  <div className="mt-0.5 text-violet-700">{scheduledAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Detail icon={MonitorSmartphone} label="Interview type" value={readable(interview.type)} />
                <Detail icon={MapPin} label="Location / meeting link" value={interview.locationOrLink || "Not provided"} />
                <Detail icon={BriefcaseBusiness} label="Job arrangement" value={`${readable(interview.employmentType)} · ${readable(interview.workMode)}`} />
                <Detail icon={MapPin} label="Job location" value={interview.jobLocation || "Not specified"} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Detail icon={UserRound} label="Hiring panelist" value={interview.panelistName || "Not assigned"} compact />
                <Detail icon={UserRound} label="Recruiter" value={interview.recruiterName || "Not assigned"} compact />
                <Detail icon={UserRound} label="HR manager" value={interview.hrManagerName || "Not assigned"} compact />
              </div>

              {canChange && (
                <div className="mt-6 flex flex-wrap gap-2 border-t border-neutral-100 pt-5">
                  {interview.status === "Proposed" && (
                    <button
                      disabled={busyId === interview.id}
                      onClick={() => act(interview.id, () => confirmInterview(interview.id))}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                    >
                      {busyId === interview.id ? <Loader2 className="animate-spin" size={16} /> : <CalendarClock size={16} />}
                      Confirm interview
                    </button>
                  )}
                  <button
                    disabled={busyId === interview.id}
                    onClick={() => {
                      const reason = window.prompt("Why do you need a different time?");
                      if (reason?.trim()) {
                        act(interview.id, () => requestNewTime(interview.id, reason.trim()));
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
                  >
                    <RefreshCw size={16} /> Request new time
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value, compact = false }) {
  return (
    <div className={`rounded-2xl border border-neutral-100 bg-neutral-50/70 ${compact ? "p-3.5" : "p-4"}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
        <Icon size={14} /> {label}
      </div>
      <p className="mt-1.5 wrap-break-word text-sm font-semibold text-neutral-700">{value}</p>
    </div>
  );
}
