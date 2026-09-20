import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Trash2 } from "lucide-react";
import { addAvailability, deleteAvailability, getAvailability } from "../../services/panelistWorkflowService";

export default function AvailabilityPage() {
  const [slots, setSlots] = useState([]);
  const [start, setStart] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(() => getAvailability().then(setSlots).catch((e) => setError(e.message)), []);
  useEffect(() => { refresh(); }, [refresh]);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try { await addAvailability(new Date(start).toISOString()); setStart(""); await refresh(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function remove(id) {
    setBusy(true); setError("");
    try { await deleteAvailability(id); await refresh(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Interview planning</p><h1 className="mt-3 text-3xl font-semibold">My availability</h1>
      <p className="mt-2 text-sm text-neutral-500">Add one-hour slots within office hours (8:00 AM–5:00 PM, Asia/Colombo). The panelist can propose a slot when you, the recruiter, and the HR Manager are all available.</p></div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <label className="text-sm font-medium">Start time (your local time)<input type="datetime-local" required value={start} onChange={(e) => setStart(e.target.value)} className="mt-2 block rounded-xl border border-neutral-200 px-3 py-2" /></label>
      <button disabled={busy} className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Add one-hour slot</button>
    </form>
    <div className="space-y-2">{slots.length === 0 && <p className="rounded-2xl bg-white p-5 text-sm text-neutral-500">No upcoming slots yet.</p>}
      {slots.map((slot) => <div key={slot.id} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"><CalendarClock className="text-blue-600" size={19} /><span className="flex-1 text-sm">{new Date(slot.startsAt).toLocaleString()} – {new Date(slot.endsAt).toLocaleTimeString()}</span><button type="button" aria-label="Remove slot" disabled={busy} onClick={() => remove(slot.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button></div>)}
    </div>
  </div>;
}
