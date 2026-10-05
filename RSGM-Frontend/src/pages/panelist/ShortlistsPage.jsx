import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search,AlertCircle, Loader2, RefreshCw, } from "lucide-react";
import {
  downloadShortlistedCandidateCv,
  getAvailableSlots,
  getHrManagers,
  getPanelistShortlists,
  proposeInterview,
} from "../../services/panelistWorkflowService";

export default function ShortlistsPage() {
  const [jobs, setJobs] = useState([]);
  const [selection, setSelection] = useState(null);
  const [managers, setManagers] = useState([]);
  const [hrId, setHrId] = useState("");
  const [slots, setSlots] = useState([]);
  const [start, setStart] = useState("");
  const [type, setType] = useState("Physical");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shortlistSearch, setShortlistSearch] = useState("");
  const [shortlistStatus, setShortlistStatus] = useState("all");

  const [candidatePreview, setCandidatePreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [cvDownloading, setCvDownloading] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getPanelistShortlists();

    setJobs(
      Array.isArray(data)
        ? data
        : []
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialShortlists() {
      try {
        const data = await getPanelistShortlists();

        if (!cancelled) {
          setJobs(
            Array.isArray(data)
              ? data
              : []
          );  
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.message || "Unable to load assigned shortlists."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

  loadInitialShortlists();

  return () => {
    cancelled = true;
  };
}, []);

  useEffect(() => {
    if (!selection) return;

    getHrManagers(selection.jobId)
      .then((people) => {
        setManagers(people);
        setHrId(people[0]?.id || "");
      })
      .catch((e) => setError(e.message));
  }, [selection]);

  useEffect(() => {
    if (!selection || !hrId) return;

    let cancelled = false;

    getAvailableSlots(selection.jobId, hrId)
      .then((data) => {
        if (!cancelled) setSlots(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, [selection, hrId]);

  const statusOptions = useMemo(() => {
    const values = new Set();

    jobs.forEach((job) => {
      (job.candidates ?? []).forEach((candidate) => {
        if (candidate.status) {
          values.add(candidate.status);
        }
      });
    });

    return Array.from(values).sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const search = shortlistSearch.trim().toLowerCase();

    return jobs
      .map((job) => {
        const jobMatchesSearch =
          !search ||
          [job.jobTitle, job.recruiter].some((value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(search)
          );

        const candidates = (job.candidates ?? []).filter(
          (candidate) => {
            const matchesStatus =
              shortlistStatus === "all" ||
              candidate.status === shortlistStatus;

            const candidateMatchesSearch =
              !search ||
              [
                candidate.candidate,
                candidate.email,
                candidate.status,
                candidate.shortlistRank,
              ].some((value) =>
                String(value ?? "")
                  .toLowerCase()
                  .includes(search)
              );

            return (
              matchesStatus &&
              (jobMatchesSearch || candidateMatchesSearch)
            );
          }
        );

        return {
          ...job,
          candidates,
        };
      })
      .filter((job) => job.candidates.length > 0);
  }, [jobs, shortlistSearch, shortlistStatus]);

  async function retryShortlists() {
    setLoading(true);
    setError("");

    try {
      const data = await getPanelistShortlists();

      setJobs(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (e) {
      setError(
        e.message || "Unable to load assigned shortlists."
      );
    } finally {
      setLoading(false);
    }
  }

  async function openCandidate(candidate, job) {
    setPreviewLoading(true);
    setPreviewError("");
    setCandidatePreview(null);

    try {
      setCandidatePreview({
        id: candidate.id,
        fullName: candidate.candidate,
        email: candidate.email,
        jobTitle: job.jobTitle,
        headline: "Shortlisted candidate",

        phoneNumber: null,
        location: null,
        bio: null,

        linkedInUrl: null,
        gitHubUrl: null,
        portfolioUrl: null,

        skills: [],
        education: [],
        workExperience: [],

        status: candidate.status,
        shortlistRank: candidate.shortlistRank,

        // Keep CV download available. If the candidate has no CV,
        // the existing download request will show its normal error.
        hasCv: true,
        cvFileName: `${candidate.candidate || "candidate"}-cv.pdf`,
      });
    } finally {
      setPreviewLoading(false);
    }
  }

  function closeCandidatePreview() {
    setCandidatePreview(null);
    setPreviewError("");
  }

  async function downloadCv() {
    if (!candidatePreview) return;

    setCvDownloading(true);
    setPreviewError("");

    try {
      await downloadShortlistedCandidateCv(
        candidatePreview.id,
        candidatePreview.cvFileName
      );
    } catch (err) {
      setPreviewError(err.message);
    } finally {
      setCvDownloading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await proposeInterview({
        applicationId: selection.candidate.id,
        hrManagerId: hrId,
        startsAt: start,
        type,
        locationOrLink: location.trim(),
      });

      setSelection(null);
      setSlots([]);
      setLocation("");

      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase text-amber-600">
        Hiring panelist
      </p>

      <h1 className="mt-3 text-3xl font-semibold">
        Ranked shortlists
      </h1>

      <p className="mt-2 text-sm text-neutral-500">
        Review shortlisted candidates before arranging interviews.
        Available interview slots consider recruiter, panelist and HR
        availability.
      </p>

      <Link
        className="mt-3 inline-block text-sm font-semibold text-amber-700"
        to="/panelist/schedule"
      >
        View your schedule →
      </Link>
      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_220px]">
        <label className="relative block">
          <span className="sr-only">
            Search shortlisted candidates
          </span>

          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />

          <input
            type="search"
            value={shortlistSearch}
            onChange={(e) =>
              setShortlistSearch(e.target.value)
            }
            placeholder="Search candidate or job..."
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </label>

        <label>
          <span className="sr-only">
            Filter by candidate status
          </span>

          <select
            value={shortlistStatus}
            onChange={(e) =>
              setShortlistStatus(e.target.value)
            }
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-700 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          >
            <option value="all">
              All statuses
            </option>

            {statusOptions.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700"
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
            onClick={retryShortlists}
            disabled={loading || busy}
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

      <div className="mt-7 space-y-5">
        {!loading && jobs.length === 0 && (
          <p className="rounded-2xl bg-white p-5 text-neutral-500">
            No shortlists assigned yet.
          </p>
        )}

        {!loading && jobs.length > 0 && filteredJobs.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <p className="font-medium text-neutral-700">
              No shortlisted candidates found
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              Try changing your search or status filter.
            </p>
          </div>
        )}

        {!loading && filteredJobs.map((job) => (
          <section
            key={job.jobPostingId}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-semibold">
              {job.jobTitle}
            </h2>

            <p className="mb-4 text-xs text-neutral-500">
              Sent by {job.recruiter} ·{" "}
              {new Date(job.submittedAt).toLocaleString()}
            </p>

            {job.candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex flex-wrap items-center gap-3 border-t border-neutral-100 py-3"
              >
                <span className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                  #{candidate.shortlistRank}
                </span>

                <div className="flex-1">
                  <p className="font-semibold">
                    {candidate.candidate}
                  </p>

                  <p className="text-xs text-neutral-500">
                    {candidate.email} · {candidate.status}
                  </p>
                </div>

                {candidate.status === "Shortlisted" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openCandidate(candidate, job)}
                      className="rounded-xl border border-amber-600 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                    >
                      View candidate
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-2xl bg-white p-5 text-sm text-neutral-500">
          <Loader2
            size={17}
            className="animate-spin"
          />

          Loading assigned shortlists...
        </div>
      )}

      {previewLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-center text-sm text-neutral-500">
              Loading candidate information...
            </p>
          </div>
        </div>
      )}

      {!previewLoading && previewError && !candidatePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Candidate information
              </h2>

              <button
                type="button"
                onClick={closeCandidatePreview}
              >
                ✕
              </button>
            </div>

            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {previewError}
            </p>
          </div>
        </div>
      )}

      {candidatePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-amber-600">
                  Candidate profile
                </p>

                <h2 className="mt-1 text-2xl font-semibold">
                  {candidatePreview.fullName}
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  {candidatePreview.jobTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCandidatePreview}
                aria-label="Close candidate profile"
              >
                ✕
              </button>
            </div>

            {previewError && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {previewError}
              </p>
            )}

            <div className="mt-6 space-y-6">
              <section className="rounded-2xl bg-amber-50 p-4">
                <p className="font-semibold">
                  {candidatePreview.headline || "Job applicant"}
                </p>

                <p className="mt-2 text-sm text-neutral-700">
                  {candidatePreview.email}
                </p>

                {candidatePreview.phoneNumber && (
                  <p className="mt-1 text-sm text-neutral-700">
                    {candidatePreview.phoneNumber}
                  </p>
                )}

                {candidatePreview.location && (
                  <p className="mt-1 text-sm text-neutral-700">
                    {candidatePreview.location}
                  </p>
                )}
              </section>

              {candidatePreview.bio && (
                <section>
                  <h3 className="font-semibold">About</h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-600">
                    {candidatePreview.bio}
                  </p>
                </section>
              )}

              <section>
                <h3 className="font-semibold">Skills</h3>

                <div className="mt-2 flex flex-wrap gap-2">
                  {candidatePreview.skills?.length ? (
                    candidatePreview.skills.map((skill, index) => (
                      <span
                        key={`${skill.name}-${index}`}
                        className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-800"
                      >
                        {skill.name} · {skill.proficiencyLevel}/5
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-400">
                      No skills provided.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="font-semibold">
                  Work experience
                </h3>

                <div className="mt-2 space-y-2">
                  {candidatePreview.workExperience?.length ? (
                    candidatePreview.workExperience.map(
                      (experience, index) => (
                        <div
                          key={index}
                          className="rounded-xl bg-neutral-50 p-3 text-sm"
                        >
                          <p className="font-medium">
                            {experience.jobTitle} ·{" "}
                            {experience.companyName}
                          </p>

                          {experience.location && (
                            <p className="mt-1 text-xs text-neutral-500">
                              {experience.location}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-neutral-500">
                            {experience.startDate} –{" "}
                            {experience.isCurrent
                              ? "Present"
                              : experience.endDate || ""}
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-neutral-400">
                      No work experience provided.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="font-semibold">Education</h3>

                <div className="mt-2 space-y-2">
                  {candidatePreview.education?.length ? (
                    candidatePreview.education.map(
                      (education, index) => (
                        <div
                          key={index}
                          className="rounded-xl bg-neutral-50 p-3 text-sm"
                        >
                          <p className="font-medium">
                            {education.degree} ·{" "}
                            {education.institution}
                          </p>

                          {education.fieldOfStudy && (
                            <p className="mt-1 text-xs text-neutral-500">
                              {education.fieldOfStudy}
                            </p>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-neutral-400">
                      No education records provided.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="font-semibold">
                  Professional links
                </h3>

                <div className="mt-2 flex flex-wrap gap-2">
                  {candidatePreview.linkedInUrl && (
                    <a
                      href={candidatePreview.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-amber-700"
                    >
                      LinkedIn ↗
                    </a>
                  )}

                  {candidatePreview.gitHubUrl && (
                    <a
                      href={candidatePreview.gitHubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-amber-700"
                    >
                      GitHub ↗
                    </a>
                  )}

                  {candidatePreview.portfolioUrl && (
                    <a
                      href={candidatePreview.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-amber-700"
                    >
                      Portfolio ↗
                    </a>
                  )}
                </div>
              </section>

              <section>
                <h3 className="font-semibold">CV</h3>

                {candidatePreview.hasCv ? (
                  <button
                    type="button"
                    disabled={cvDownloading}
                    onClick={downloadCv}
                    className="mt-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {cvDownloading
                      ? "Downloading..."
                      : `Download ${
                          candidatePreview.cvFileName || "CV"
                        }`}
                  </button>
                ) : (
                  <p className="mt-2 text-sm text-neutral-400">
                    No CV uploaded.
                  </p>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

      {selection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">
                Interview · {selection.candidate.candidate}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setSelection(null);
                  setSlots([]);
                  setStart("");
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <label className="block text-sm font-medium">
              HR Manager

              <select
                required
                className="mt-2 w-full rounded-xl border border-neutral-200 p-3"
                value={hrId}
                onChange={(e) => {
                  setHrId(e.target.value);
                  setSlots([]);
                  setStart("");
                }}
              >
                {managers.map((manager) => (
                  <option
                    key={manager.id}
                    value={manager.id}
                  >
                    {manager.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              Available one-hour slot

              <select
                required
                className="mt-2 w-full rounded-xl border border-neutral-200 p-3"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              >
                <option value="">
                  Select a slot
                </option>

                {slots.map((iso) => (
                  <option
                    key={iso}
                    value={iso}
                  >
                    {new Date(iso).toLocaleString()}
                  </option>
                ))}
              </select>
            </label>

            {!slots.length && (
              <p className="text-sm text-amber-700">
                No free slots were found in the next 30 days.
              </p>
            )}

            <label className="block text-sm font-medium">
              Mode

              <select
                className="mt-2 w-full rounded-xl border border-neutral-200 p-3"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option>Physical</option>
                <option>Online</option>
              </select>
            </label>

            <label className="block text-sm font-medium">
              {type === "Online"
                ? "Meeting link"
                : "Office location"}

              <input
                required
                maxLength={500}
                type={type === "Online" ? "url" : "text"}
                className="mt-2 w-full rounded-xl border border-neutral-200 p-3"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>

            <button
              disabled={busy || !start}
              className="w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Send interview proposal
            </button>
          </form>
        </div>
      )}
    </div>
  );
}