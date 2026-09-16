import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, Briefcase, CheckCircle2, Loader2, MapPin, Search, Sparkles,
} from "lucide-react";

import { getJobPostings } from "../../services/jobPostingService";
import { applyToJob, getMyApplications } from "../../services/jobSeekerApplicationService";

function BrowseJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [applyingJobId, setApplyingJobId] = useState(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([getJobPostings(), getMyApplications()])
      .then(([postings, applications]) => {
        if (ignore) return;
        setJobs(postings);
        setAppliedJobIds(
          new Set(
            applications
              .filter((a) => a.status !== "Withdrawn")
              .map((a) => a.jobPostingId)
          )
        );
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "Unable to load jobs.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(query.toLowerCase()) ||
        j.company.toLowerCase().includes(query.toLowerCase())
    );
  }, [jobs, query]);

  const handleApply = async (jobId) => {
    setError("");
    setApplyingJobId(jobId);

    try {
      await applyToJob(jobId);
      setAppliedJobIds((prev) => new Set(prev).add(jobId));
    } catch (err) {
      setError(err.message || "Unable to submit application.");
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        BROWSE JOBS
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Jobs for you</h1>
      <p className="mt-2 text-neutral-500">
        Open roles matching your profile.
      </p>

      <div className="relative mt-8 max-w-sm">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs or companies..."
          className="w-full h-11 rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
        />
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600 max-w-lg">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-neutral-400">
          <Loader2 size={18} className="animate-spin" />
          Loading jobs...
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filteredJobs.map((j) => {
            const applied = appliedJobIds.has(j.id);
            const isApplying = applyingJobId === j.id;

            return (
              <div
                key={j.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                    <Briefcase size={20} className="text-violet-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900">{j.title}</p>
                    <p className="mt-0.5 text-sm text-neutral-500">
                      {j.company} · <span className="inline-flex items-center gap-1"><MapPin size={12} />{j.location}</span>
                    </p>
                    {j.description && (
                      <p className="mt-1.5 text-sm text-neutral-500 line-clamp-2 max-w-xl">{j.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {j.requiredSkills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {applied ? (
                    <span className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-semibold">
                      <CheckCircle2 size={14} />
                      Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(j.id)}
                      disabled={isApplying}
                      className="h-10 px-4 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60 flex items-center gap-2"
                    >
                      {isApplying && <Loader2 size={14} className="animate-spin" />}
                      Apply
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredJobs.length === 0 && (
            <div className="py-16 text-center text-sm text-neutral-400 rounded-2xl border border-neutral-200 bg-white">
              No jobs match your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BrowseJobsPage;