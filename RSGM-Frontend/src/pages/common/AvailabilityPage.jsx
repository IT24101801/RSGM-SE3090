import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Trash2 } from "lucide-react";
import { addBusyTime, deleteBusyTime, getBusyTimes } from "../../services/panelistWorkflowService";

const emptyForm = { title: "", startsAt: "", endsAt: "", description: "" };

export default function AvailabilityPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const path = window.location.pathname;
  const theme = path.startsWith("/hr") ? "emerald" : path.startsWith("/panelist") ? "amber" : "blue";
  const accent = theme === "emerald" ? "text-emerald-600" : theme === "amber" ? "text-amber-600" : "text-blue-600";
  const button = theme === "emerald" ? "bg-emerald-600" : theme === "amber" ? "bg-amber-600" : "bg-blue-600";

  const refresh = useCallback(() => getBusyTimes().then(setEvents).catch((e) => setError(e.message)), []);
  useEffect(() => { refresh(); }, [refresh]);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await addBusyTime({
        title: form.title.trim(), description: form.description.trim() || null,
        startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt).toISOString(),
      });
      setForm(emptyForm); await refresh();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function remove(id) {
    setBusy(true); setError("");
    try { await deleteBusyTime(id); await refresh(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  const update = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  return <div className="space-y-6">
    <div><p className={`text-xs font-semibold uppercase tracking-wider ${accent}`}>Interview planning</p>
      <h1 className="mt-3 text-3xl font-semibold">My schedule</h1>
      <p className="mt-2 text-sm text-neutral-500">Add meetings and other times when you cannot attend an interview. All other office-hour times are treated as available automatically.</p></div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-2">
      <label className="text-sm font-medium sm:col-span-2">Meeting or event name<input required maxLength={150} value={form.title} onChange={update("title")} placeholder="Weekly team meeting" className="mt-2 block w-full rounded-xl border border-neutral-200 px-3 py-2.5" /></label>
      <label className="text-sm font-medium">Start<input type="datetime-local" required value={form.startsAt} onChange={update("startsAt")} className="mt-2 block w-full rounded-xl border border-neutral-200 px-3 py-2.5" /></label>
      <label className="text-sm font-medium">End<input type="datetime-local" required min={form.startsAt} value={form.endsAt} onChange={update("endsAt")} className="mt-2 block w-full rounded-xl border border-neutral-200 px-3 py-2.5" /></label>
      <label className="text-sm font-medium sm:col-span-2">Description <span className="font-normal text-neutral-400">(optional)</span><textarea maxLength={500} rows={2} value={form.description} onChange={update("description")} className="mt-2 block w-full rounded-xl border border-neutral-200 px-3 py-2.5" /></label>
      <button disabled={busy} className={`rounded-xl ${button} px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2`}>Add busy time</button>
    </form>
    <div className="space-y-2"><h2 className="font-semibold">Upcoming busy times</h2>
      {events.length === 0 && <p className="rounded-2xl bg-white p-5 text-sm text-neutral-500">No busy times added. Your office hours are currently available for interview scheduling.</p>}
      {events.map((event) => <div key={event.id} className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"><CalendarClock className={accent} size={19} />
        <div className="flex-1"><p className="text-sm font-semibold">{event.title}</p><p className="mt-1 text-sm text-neutral-600">{new Date(event.startsAt).toLocaleString()} – {new Date(event.endsAt).toLocaleString()}</p>{event.description && <p className="mt-1 text-xs text-neutral-500">{event.description}</p>}</div>
        <button type="button" aria-label="Delete busy time" disabled={busy} onClick={() => remove(event.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button></div>)}
    </div>
  </div>;
}
