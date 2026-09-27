import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  downloadShortlistedCandidateCv,
  getAvailableSlots,
  getHrManagers,
  getPanelistShortlists,
  getShortlistedCandidate,
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

  const [candidatePreview, setCandidatePreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [cvDownloading, setCvDownloading] = useState(false);

  const refresh = useCallback(
    () =>
      getPanelistShortlists()
        .then(setJobs)
        .catch((e) => setError(e.message)),
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

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

  async function openCandidate(candidate) {
    setPreviewLoading(true);
    setPreviewError("");
    setCandidatePreview(null);

    try {
      const details = await getShortlistedCandidate(candidate.id);
      setCandidatePreview(details);
    } catch (err) {
      setPreviewError(err.message);
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
        Manage your busy schedule →
      </Link>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-7 space-y-5">
        {jobs.length === 0 && (
          <p className="rounded-2xl bg-white p-5 text-neutral-500">
            No shortlists assigned yet.
          </p>
        )}

        {jobs.map((job) => (
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
                      onClick={() => openCandidate(candidate)}
                      className="rounded-xl border border-amber-600 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                    >
                      View candidate
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelection({
                          jobId: job.jobPostingId,
                          candidate,
                        });

                        setSlots([]);
                        setStart("");
                      }}
                      className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Propose interview
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>

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