import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Clock3, Loader2, RefreshCw } from "lucide-react";
import {
  getNotifications, markAllNotificationsRead, markNotificationRead,
} from "../../services/notificationService";

export default function NotificationsPage({ role }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const accent = role === "panelist" ? "amber" : "violet";

  const refresh = useCallback(async () => {
    try { setItems(await getNotifications()); setError(""); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(() => {
      if (!document.hidden) refresh();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function open(item) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      if (!item.readAt) {
        await markNotificationRead(item.id);
        setItems((current) => current.map((entry) => entry.id === item.id
          ? { ...entry, readAt: new Date().toISOString() } : entry));
        window.dispatchEvent(new Event("notifications-updated"));
      }
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function markAll() {
    setBusy(true); setError("");
    try {
      await markAllNotificationsRead();
      setItems((current) => current.map((item) =>
        item.readAt ? item : { ...item, readAt: new Date().toISOString() }));
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const unread = items.filter((item) => !item.readAt).length;
  const color = accent === "amber" ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-700";

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold ${color}`}><Bell size={13} />YOUR UPDATES</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Notifications</h1>
        <p className="mt-2 text-neutral-500">Interview invitations and schedule changes.</p></div>
      <div className="flex gap-2">
        <button type="button" onClick={refresh} aria-label="Refresh notifications" className="rounded-xl border border-neutral-200 bg-white p-2.5 text-neutral-700 hover:bg-neutral-50"><RefreshCw size={17} /></button>
        <button type="button" onClick={markAll} disabled={busy || unread === 0} className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><CheckCheck size={16} />Mark all read</button>
      </div>
    </div>
    {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-8 space-y-3">
      {loading && <p className="flex items-center gap-2 text-sm text-neutral-500"><Loader2 size={17} className="animate-spin" />Loading notifications…</p>}
      {!loading && items.length === 0 && <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">You have no notifications yet.</div>}
      {items.map((item) => <button type="button" key={item.id} onClick={() => open(item)} disabled={busy || Boolean(item.readAt)} aria-label={`${item.title}. ${item.readAt ? "Read" : "Mark as read"}`} className={`w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition enabled:hover:shadow-md ${item.readAt ? "border-neutral-200" : accent === "amber" ? "border-amber-300" : "border-violet-300"}`}>
        <div className="flex items-start gap-3">
          <span className={`rounded-xl p-2.5 ${color}`}><Bell size={16} /></span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2"><span className="font-semibold text-neutral-900">{item.title}</span>{!item.readAt && <span className={`h-2 w-2 rounded-full ${accent === "amber" ? "bg-amber-500" : "bg-violet-500"}`} />}</span>
            <span className="mt-1 block whitespace-pre-wrap wrap-break-word text-sm text-neutral-600">{item.message}</span>
            <span className="mt-2 flex items-center gap-1 text-xs text-neutral-400"><Clock3 size={12} />{new Date(item.createdAt).toLocaleString()}</span>
          </span>
        </div>
      </button>)}
    </div>
  </div>;
}
