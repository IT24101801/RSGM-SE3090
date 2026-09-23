import { useCallback, useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { confirmInterview, getCandidateInterviews, requestNewTime } from "../../services/panelistWorkflowService";

export default function MyInterviewsPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(() => getCandidateInterviews().then(setRows).catch((e) => setError(e.message)), []);
  useEffect(() => { refresh(); }, [refresh]);
  async function act(action) { setBusy(true); setError(""); try { await action(); await refresh(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  return <div><p className="text-xs font-semibold uppercase text-violet-600">Your applications</p><h1 className="mt-3 text-3xl font-semibold">My interviews</h1>
    <p className="mt-2 text-sm text-neutral-500">Confirm a proposed interview or ask the panelist to propose a different time.</p>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    <div className="mt-7 space-y-3">{rows.length === 0 && <p className="rounded-2xl bg-white p-5 text-neutral-500">No interviews yet.</p>}
      {rows.map((i) => <article key={i.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"><div className="flex items-start gap-3"><CalendarClock className="text-violet-600" /><div className="flex-1"><h2 className="font-semibold">{i.job}</h2><p className="mt-1 text-sm text-neutral-600">{new Date(i.scheduledAt).toLocaleString()} · {i.type}</p><p className="mt-1 text-sm text-neutral-500">{i.locationOrLink}</p><span className="mt-2 inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{i.status}</span></div></div>
        {new Date(i.scheduledAt) > new Date() && ["Proposed", "Scheduled"].includes(i.status) && <div className="mt-4 flex gap-2">{i.status === "Proposed" && <button disabled={busy} onClick={() => act(() => confirmInterview(i.id))} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">Confirm interview</button>}<button disabled={busy} onClick={() => { const reason = window.prompt("Why do you need a different time?"); if (reason?.trim()) act(() => requestNewTime(i.id, reason.trim())); }} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold">Request new time</button></div>}
      </article>)}
    </div>
  </div>;
}
