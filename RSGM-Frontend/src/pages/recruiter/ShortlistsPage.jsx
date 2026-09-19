import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle, ArrowDown, ArrowLeft, ArrowUp,
  BriefcaseBusiness, CircleCheck, Loader2,
  Medal, Sparkles, Star, Trash2, Users,
} from "lucide-react";

import {
  getRecruiterApplicants,
  rankRecruiterShortlist,
  reviewRecruiterApplicant,
} from "../../services/recruiterApplicantService";

const card =
  "rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30";

export default function ShortlistsPage() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
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

  const groups = useMemo(() => {
    const jobs = new Map();

    applicants
      .filter((a) => a.status === "Shortlisted")
      .forEach((a) => {
        if (!jobs.has(a.jobPostingId)) {
          jobs.set(a.jobPostingId, {
            id: a.jobPostingId,
            title: a.jobTitle,
            candidates: [],
          });
        }

        jobs.get(a.jobPostingId).candidates.push(a);
      });

    return [...jobs.values()].map((job) => ({
      ...job,
      candidates: job.candidates.sort(
        (a, b) =>
          (a.shortlistRank ?? 9999) -
            (b.shortlistRank ?? 9999) ||
          b.matchScore - a.matchScore
      ),
    }));
  }, [applicants]);

  const total = groups.reduce(
    (sum, job) => sum + job.candidates.length,
    0
  );

  async function move(job, index, offset) {
    const other = index + offset;

    if (
      other < 0 ||
      other >= job.candidates.length
    ) {
      return;
    }

    const reordered = [...job.candidates];

    [reordered[index], reordered[other]] = [
      reordered[other],
      reordered[index],
    ];

    setBusy(true);
    setError("");

    try {
      const updated = await rankRecruiterShortlist(
        job.id,
        reordered.map((a) => a.id)
      );

      setApplicants((previous) =>
        previous.map(
          (a) =>
            updated.find(
              (item) => item.id === a.id
            ) || a
        )
      );
    } catch (e) {
      setError(
        e.message || "Unable to save the new rank."
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    setBusy(true);
    setError("");

    try {
      await reviewRecruiterApplicant(
        id,
        "UnderReview"
      );

      setApplicants(
        await getRecruiterApplicants()
      );
    } catch (e) {
      setError(
        e.message ||
          "Unable to remove this candidate."
      );
    } finally {
      setBusy(false);
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
            Ranked shortlists
          </h1>

          <p className="mt-2 text-neutral-500">
            Choose the strongest candidates and set their order
            for each position.
          </p>
        </div>

        <Link
          to="/recruiter/applications"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          <ArrowLeft size={16} />
          Review applications
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric
          icon={Users}
          label="Shortlisted candidates"
          value={loading ? "—" : total}
        />

        <Metric
          icon={BriefcaseBusiness}
          label="Positions with shortlists"
          value={loading ? "—" : groups.length}
        />

        <div className={`${card} flex items-center gap-3 p-5`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Medal size={19} />
          </div>

          <p className="text-sm text-neutral-600">
            Rank{" "}
            <strong className="text-neutral-900">
              #1
            </strong>{" "}
            is your first choice for each job.
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle
            size={17}
            className="shrink-0"
          />
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-neutral-400">
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading shortlists...
        </div>
      ) : groups.length === 0 ? (
        <div className={`${card} mt-8 py-16 text-center`}>
          <Users
            size={28}
            className="mx-auto text-blue-300"
          />

          <h2 className="mt-3 font-semibold">
            No shortlisted candidates yet
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Review applications and shortlist the
            candidates you want to consider.
          </p>

          <Link
            to="/recruiter/applications"
            className="mt-5 inline-block rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            View applications
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {groups.map((job) => (
            <section
              key={job.id}
              className={`${card} overflow-hidden`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <BriefcaseBusiness size={19} />
                  </span>

                  <div>
                    <h2 className="font-semibold text-neutral-900">
                      {job.title}
                    </h2>

                    <p className="mt-0.5 text-xs text-neutral-400">
                      {job.candidates.length} candidate
                      {job.candidates.length === 1
                        ? ""
                        : "s"}{" "}
                      ranked
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <CircleCheck size={13} />
                  Shortlist in progress
                </span>
              </div>

              <div className="divide-y divide-neutral-100">
                {job.candidates.map((a, index) => (
                  <div
                    key={a.id}
                    className="flex flex-col gap-4 px-5 py-5 transition hover:bg-blue-50/25 sm:flex-row sm:items-center sm:px-6"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
                        index === 0
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      #{index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-neutral-900">
                          {a.fullName}
                        </h3>

                        {index === 0 && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                            Top choice
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-neutral-400">
                        {a.email}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
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

                        {(a.matchedSkills || []).length ===
                          0 && (
                          <span className="text-xs text-neutral-400">
                            No required skills matched
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />
                        {a.matchScore}% match
                      </span>

                      <div className="flex gap-1">
                        <RankButton
                          icon={ArrowUp}
                          title="Move up"
                          disabled={busy || index === 0}
                          onClick={() =>
                            move(job, index, -1)
                          }
                        />

                        <RankButton
                          icon={ArrowDown}
                          title="Move down"
                          disabled={
                            busy ||
                            index ===
                              job.candidates.length - 1
                          }
                          onClick={() =>
                            move(job, index, 1)
                          }
                        />

                        <RankButton
                          icon={Trash2}
                          title="Remove from shortlist"
                          danger
                          disabled={busy}
                          onClick={() =>
                            remove(a.id)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          {label}
        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <Icon size={17} />
        </span>
      </div>

      <p className="mt-2 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function RankButton({
  icon: Icon,
  title,
  onClick,
  disabled,
  danger,
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-neutral-200 text-neutral-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      <Icon size={15} />
    </button>
  );
}