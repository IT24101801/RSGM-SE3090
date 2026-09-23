import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock3,
  Download,
  FileStack,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  downloadRecruiterApplicantCv,
  getRecruiterApplicants,
  reviewRecruiterApplicant,
} from "../../services/recruiterApplicantService";

const STATUS = {
  UnderReview: {
    label: "Under review",
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  Shortlisted: {
    label: "Shortlisted",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  Rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-600 border-red-100",
  },
  Interview: {
    label: "Interview",
    className: "bg-blue-50 text-blue-700 border-blue-100",
  },
  Offer: {
    label: "Offer",
    className: "bg-violet-50 text-violet-700 border-violet-100",
  },
};

const surface =
  "rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30";

const input =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white/80 px-4 text-sm text-neutral-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

function initials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function readableDate(value) {
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
}

function safeUrl(url) {
  return /^https?:\/\//i.test(url || "") ? url : null;
}

export default function ApplicationsPage() {
  const [applicants, setApplicants] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    getRecruiterApplicants()
      .then((items) => {
        if (alive) setApplicants(items);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const jobs = useMemo(
    () => [
      ...new Map(
        applicants.map((a) => [
          a.jobPostingId,
          a.jobTitle,
        ])
      ).entries(),
    ],
    [applicants]
  );

  const filtered = useMemo(
    () =>
      applicants.filter(
        (a) =>
          (!jobId || a.jobPostingId === jobId) &&
          (status === "All" || a.status === status) &&
          `${a.fullName} ${a.email} ${a.jobTitle}`
            .toLowerCase()
            .includes(query.trim().toLowerCase())
      ),
    [applicants, jobId, query, status]
  );

  const selected = applicants.find(
    (a) => a.id === selectedId
  );

  const newCount = applicants.filter(
    (a) => a.status === "UnderReview"
  ).length;

  const shortlistedCount = applicants.filter(
    (a) => a.status === "Shortlisted"
  ).length;

  async function decide(id, decision) {
    setBusyId(id);
    setError("");

    try {
      await reviewRecruiterApplicant(id, decision);

      // Refresh ranks after a candidate leaves the shortlist.
      setApplicants(await getRecruiterApplicants());
    } catch (e) {
      setError(
        e.message || "Unable to update the application."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function download(applicant) {
    setError("");

    try {
      await downloadRecruiterApplicantCv(
        applicant.id,
        applicant.cvFileName
      );
    } catch (e) {
      setError(
        e.message || "Unable to download the CV."
      );
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-600">
            <Sparkles size={12} />
            RECRUITER WORKSPACE
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Applications
          </h1>

          <p className="mt-2 text-neutral-500">
            Review applicants for your job postings and
            choose who moves forward.
          </p>
        </div>

        <Link
          to="/recruiter/shortlists"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <Users size={16} />
          View shortlists
          <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric
          icon={FileStack}
          label="Total applications"
          value={applicants.length}
          loading={loading}
        />

        <Metric
          icon={Clock3}
          label="Awaiting review"
          value={newCount}
          loading={loading}
        />

        <Metric
          icon={CircleCheck}
          label="Shortlisted"
          value={shortlistedCount}
          loading={loading}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={17} className="shrink-0" />
          {error}
        </div>
      )}

      <section className={`${surface} mt-7 overflow-hidden`}>
        <div className="border-b border-neutral-100 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-neutral-900">
                Candidate pipeline
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                {filtered.length} applicant
                {filtered.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600">
              Your job postings only
            </span>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px_180px]">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3.5 top-3.5 text-neutral-400"
              />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email or job"
                className={`${input} pl-10`}
                aria-label="Search applications"
              />
            </div>

            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className={input}
              aria-label="Filter by job"
            >
              <option value="">All job postings</option>

              {jobs.map(([id, title]) => (
                <option value={id} key={id}>
                  {title}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={input}
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              <option value="UnderReview">
                Under review
              </option>
              <option value="Shortlisted">
                Shortlisted
              </option>
              <option value="Rejected">
                Rejected
              </option>
              <option value="Interview">
                Interview
              </option>
              <option value="Offer">
                Offer
              </option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-neutral-400">
            <Loader2 size={18} className="animate-spin" />
            Loading applications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FileStack
              size={26}
              className="mx-auto text-blue-300"
            />

            <p className="mt-3 font-medium text-neutral-700">
              No applications found
            </p>

            <p className="mt-1 text-sm text-neutral-400">
              Try a different filter, or wait for
              candidates to apply.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="p-5 transition hover:bg-blue-50/25 sm:p-6"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-sm font-bold text-blue-700">
                    {initials(a.fullName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-neutral-900">
                        {a.fullName}
                      </h3>

                      <StatusBadge status={a.status} />

                      {a.status === "Shortlisted" &&
                        a.shortlistRank != null && (
                          <span className="text-xs font-semibold text-blue-600">
                            Rank #{a.shortlistRank}
                          </span>
                        )}
                    </div>

                    <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                      <BriefcaseBusiness
                        size={14}
                        className="shrink-0"
                      />
                      {a.jobTitle}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Mail size={12} />
                        {a.email}
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock3 size={12} />
                        Applied {readableDate(a.appliedAt)}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(a.matchedSkills || [])
                        .slice(0, 4)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700"
                          >
                            {skill}
                          </span>
                        ))}

                      {(a.matchedSkills || []).length === 0 && (
                        <span className="text-xs text-neutral-400">
                          No required skills matched yet
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                      {a.matchScore}%{" "}
                      <span className="text-xs font-normal">
                        skill match
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedId(a.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Full profile
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 pl-0 sm:pl-15">
                  <Action
                    onClick={() => setSelectedId(a.id)}
                    icon={UserRound}
                    label="Review details"
                  />

                  {a.status !== "Shortlisted" &&
                    a.status !== "Interview" &&
                    a.status !== "Offer" && (
                      <Action
                        onClick={() =>
                          decide(a.id, "Shortlisted")
                        }
                        icon={Check}
                        label="Shortlist"
                        blue
                        disabled={busyId === a.id}
                      />
                    )}

                  {a.status !== "Rejected" &&
                    a.status !== "Interview" &&
                    a.status !== "Offer" && (
                      <Action
                        onClick={() =>
                          decide(a.id, "Rejected")
                        }
                        icon={CircleX}
                        label="Reject"
                        danger
                        disabled={busyId === a.id}
                      />
                    )}

                  {(a.status === "Rejected" ||
                    a.status === "Shortlisted") && (
                    <Action
                      onClick={() =>
                        decide(a.id, "UnderReview")
                      }
                      icon={Clock3}
                      label="Return to review"
                      disabled={busyId === a.id}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <CandidatePanel
          applicant={selected}
          busy={busyId === selected.id}
          onClose={() => setSelectedId(null)}
          onDownload={() => download(selected)}
          onDecision={(decision) =>
            decide(selected.id, decision)
          }
        />
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  loading,
}) {
  return (
    <div className={`${surface} p-5`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          {label}
        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <Icon size={17} />
        </span>
      </div>

      <p className="mt-2 text-2xl font-semibold tracking-tight">
        {loading ? "—" : value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const style = STATUS[status] || {
    label: status,
    className:
      "bg-neutral-100 text-neutral-600 border-neutral-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${style.className}`}
    >
      {style.label}
    </span>
  );
}

function Action({
  onClick,
  icon: Icon,
  label,
  blue,
  danger,
  disabled,
}) {
  const color = blue
    ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
    : danger
      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
      : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${color}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function Details({ title, items }) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
        {title}
      </h3>

      <div className="mt-3 space-y-2">
        {items?.length ? (
          items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
            >
              {item}
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-400">
            Not provided
          </p>
        )}
      </div>
    </section>
  );
}

function CandidatePanel({
  applicant: a,
  busy,
  onClose,
  onDownload,
  onDecision,
}) {
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", close);

    return () =>
      window.removeEventListener("keydown", close);
  }, [onClose]);

  const links = [
    ["LinkedIn", a.linkedInUrl, Globe2],
    ["GitHub", a.gitHubUrl, Globe2],
    ["Portfolio", a.portfolioUrl, Globe2],
  ].filter(([, url]) => safeUrl(url));

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-neutral-900/40 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${a.fullName} application details`}
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 font-semibold text-blue-700">
                {initials(a.fullName)}
              </span>

              <div>
                <h2 className="text-lg font-semibold">
                  {a.fullName}
                </h2>

                <p className="text-xs text-neutral-500">
                  {a.headline || "Candidate profile"}
                </p>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <StatusBadge status={a.status} />

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                {a.matchScore}% skill match
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="rounded-xl border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50"
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-6 py-6">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm">
            <p className="font-semibold text-neutral-900">
              {a.jobTitle}
            </p>

            <p className="mt-1 text-neutral-500">
              Applied {readableDate(a.appliedAt)}
              {a.shortlistRank
                ? ` · Shortlist rank #${a.shortlistRank}`
                : ""}
            </p>
          </div>

          <section className="grid gap-2 text-sm text-neutral-600">
            <p className="flex items-center gap-2">
              <Mail size={15} className="text-blue-500" />
              {a.email}
            </p>

            {a.phoneNumber && (
              <p className="flex items-center gap-2">
                <Phone size={15} className="text-blue-500" />
                {a.phoneNumber}
              </p>
            )}

            {a.location && (
              <p className="flex items-center gap-2">
                <MapPin size={15} className="text-blue-500" />
                {a.location}
              </p>
            )}
          </section>

          {a.bio && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                About
              </h3>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {a.bio}
              </p>
            </section>
          )}

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Candidate skills
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {a.skills?.length ? (
                a.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-neutral-400">
                  No skills added
                </p>
              )}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <Details
              title="Matched job skills"
              items={a.matchedSkills}
            />

            <Details
              title="Skills to develop"
              items={a.missingSkills}
            />
          </section>

          <Details
            title="Education"
            items={a.education}
          />

          <Details
            title="Work experience"
            items={a.workExperience}
          />

          {links.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {links.map(([label, url, Icon]) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                >
                  <Icon size={14} />
                  {label}
                  <ArrowUpRight size={12} />
                </a>
              ))}
            </div>
          )}

          {a.hasCv && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              <Download size={16} />
              Download {a.cvFileName || "CV"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-neutral-100 bg-white px-6 py-4">
          {a.status !== "Shortlisted" &&
            a.status !== "Interview" &&
            a.status !== "Offer" && (
              <Action
                onClick={() => onDecision("Shortlisted")}
                icon={CircleCheck}
                label="Shortlist candidate"
                blue
                disabled={busy}
              />
            )}

          {a.status !== "Rejected" &&
            a.status !== "Interview" &&
            a.status !== "Offer" && (
              <Action
                onClick={() => onDecision("Rejected")}
                icon={CircleX}
                label="Reject"
                danger
                disabled={busy}
              />
            )}

          {(a.status === "Shortlisted" ||
            a.status === "Rejected") && (
            <Action
              onClick={() => onDecision("UnderReview")}
              icon={Clock3}
              label="Return to review"
              disabled={busy}
            />
          )}
        </div>
      </div>
    </div>
  );
}