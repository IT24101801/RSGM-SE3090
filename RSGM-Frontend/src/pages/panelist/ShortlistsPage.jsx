import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAvailableSlots, getHrManagers, getPanelistShortlists, proposeInterview } from "../../services/panelistWorkflowService";

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
  const refresh = useCallback(() => getPanelistShortlists().then(setJobs).catch((e) => setError(e.message)), []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (!selection) return;
    getHrManagers(selection.jobId).then((people) => { setManagers(people); setHrId(people[0]?.id || ""); }).catch((e) => setError(e.message));
  }, [selection]);
  useEffect(() => {
    setSlots([]); setStart("");
    if (selection && hrId) getAvailableSlots(selection.jobId, hrId).then(setSlots).catch((e) => setError(e.message));
  }, [selection, hrId]);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await proposeInterview({ applicationId: selection.candidate.id, hrManagerId: hrId, startsAt: start, type, locationOrLink: location.trim() });
      setSelection(null); setSlots([]); setLocation(""); await refresh();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <div><p className="text-xs font-semibold uppercase text-amber-600">Hiring panelist</p><h1 className="mt-3 text-3xl font-semibold">Ranked shortlists</h1>
    <p className="mt-2 text-sm text-neutral-500">Select a candidate and choose a free office-hour slot. Busy meetings and existing company interviews are removed automatically.</p>
    <Link className="mt-3 inline-block text-sm font-semibold text-amber-700" to="/panelist/schedule">Manage your busy schedule →</Link>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-7 space-y-5">{jobs.length === 0 && <p className="rounded-2xl bg-white p-5 text-neutral-500">No shortlists assigned yet.</p>}
      {jobs.map((job) => <section key={job.jobPostingId} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">{job.jobTitle}</h2><p className="mb-4 text-xs text-neutral-500">Sent by {job.recruiter} · {new Date(job.submittedAt).toLocaleString()}</p>
        {job.candidates.map((candidate) => <div key={candidate.id} className="flex flex-wrap items-center gap-3 border-t border-neutral-100 py-3"><span className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">#{candidate.shortlistRank}</span><div className="flex-1"><p className="font-semibold">{candidate.candidate}</p><p className="text-xs text-neutral-500">{candidate.email} · {candidate.status}</p></div>{candidate.status === "Shortlisted" && <button onClick={() => setSelection({ jobId: job.jobPostingId, candidate })} className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white">Propose interview</button>}</div>)}
      </section>)}
    </div>
    {selection && <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4"><form onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl"><div className="flex justify-between"><h2 className="text-lg font-semibold">Interview · {selection.candidate.candidate}</h2><button type="button" onClick={() => setSelection(null)} aria-label="Close">✕</button></div>
      <label className="block text-sm font-medium">HR Manager<select required className="mt-2 w-full rounded-xl border border-neutral-200 p-3" value={hrId} onChange={(e) => setHrId(e.target.value)}>{managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
      <label className="block text-sm font-medium">Available one-hour slot<select required className="mt-2 w-full rounded-xl border border-neutral-200 p-3" value={start} onChange={(e) => setStart(e.target.value)}><option value="">Select a slot</option>{slots.map((iso) => <option key={iso} value={iso}>{new Date(iso).toLocaleString()}</option>)}</select></label>
      {!slots.length && <p className="text-sm text-amber-700">No free slots were found in the next 30 days.</p>}
      <label className="block text-sm font-medium">Mode<select className="mt-2 w-full rounded-xl border border-neutral-200 p-3" value={type} onChange={(e) => setType(e.target.value)}><option>Physical</option><option>Online</option></select></label>
      <label className="block text-sm font-medium">{type === "Online" ? "Meeting link" : "Office location"}<input required maxLength={500} type={type === "Online" ? "url" : "text"} className="mt-2 w-full rounded-xl border border-neutral-200 p-3" value={location} onChange={(e) => setLocation(e.target.value)} /></label>
      <button disabled={busy || !start} className="w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Send interview proposal</button>
    </form></div>}
  </div>;
}
