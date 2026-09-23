import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { acceptOffer, declineOffer, getJobSeekerOffers } from "../../services/hiringWorkflowService";

export default function MyOffersPage() {
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [declining, setDeclining] = useState(null);
  const [reason, setReason] = useState("");
  const refresh = useCallback(() => getJobSeekerOffers().then(setOffers), []);
  useEffect(() => { refresh().catch((e) => setError(e.message)).finally(() => setLoading(false)); }, [refresh]);

  async function act(id, action) {
    setBusy(id); setError("");
    try { await action(); await refresh(); setDeclining(null); setReason(""); }
    catch (e) { setError(e.message); } finally { setBusy(null); }
  }

  return <div>
    <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-600"><BadgeCheck size={13} />JOB OFFERS</span>
    <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">My offers</h1>
    <p className="mt-2 text-neutral-500">Review approved offers and accept or decline them.</p>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="mt-8 space-y-4">
      {loading && <p className="flex items-center gap-2 text-sm text-neutral-500"><Loader2 className="animate-spin" size={16} />Loading offers…</p>}
      {!loading && offers.length === 0 && <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">You have no approved offers yet.</div>}
      {offers.map((offer) => <article key={offer.id} className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-xl shadow-neutral-200/30">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">{offer.job}</h2><p className="mt-1 text-sm text-neutral-500">{offer.company}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${offer.status === "Accepted" ? "bg-emerald-50 text-emerald-700" : offer.status === "Declined" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{offer.status === "Approved" ? "Awaiting your response" : offer.status}</span></div>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-neutral-400">Salary</dt><dd className="mt-1 font-semibold">{offer.currency} {Number(offer.salary).toLocaleString()}</dd></div><div><dt className="text-neutral-400">Start date</dt><dd className="mt-1 font-semibold">{new Date(`${offer.startDate}T00:00:00`).toLocaleDateString()}</dd></div></dl>
        {offer.notes && <p className="mt-4 whitespace-pre-wrap rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600">{offer.notes}</p>}
        {offer.candidateDeclineReason && <p className="mt-3 text-sm text-red-600">Your reason: {offer.candidateDeclineReason}</p>}
        {offer.status === "Approved" && <div className="mt-5 flex flex-wrap gap-3"><button disabled={busy === offer.id} onClick={() => { if (window.confirm("Accept this job offer?")) act(offer.id, () => acceptOffer(offer.id)); }} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle2 size={17} />Accept offer</button><button disabled={busy === offer.id} onClick={() => setDeclining(offer)} className="flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50"><XCircle size={17} />Decline offer</button></div>}
      </article>)}
    </div>
    {declining && <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"><form onSubmit={(e) => { e.preventDefault(); act(declining.id, () => declineOffer(declining.id, reason.trim())); }} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-semibold">Decline offer</h2><p className="mt-1 text-sm text-neutral-500">Please give the recruiter and HR a short reason.</p><textarea autoFocus required maxLength={1000} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-5 w-full rounded-xl border border-neutral-200 p-3 text-sm" /><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setDeclining(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm">Cancel</button><button disabled={!reason.trim() || busy === declining.id} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Confirm decline</button></div></form></div>}
  </div>;
}
