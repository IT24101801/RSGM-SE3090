import { useCallback, useEffect, useState } from "react";
import { AlertCircle, BadgeCheck, CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";
import { approveOffer, getHrOffers, rejectOffer } from "../../services/hiringWorkflowService";

const statusColor = {
  Submitted: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Accepted: "bg-emerald-100 text-emerald-800",
  Declined: "bg-red-100 text-red-800",
};

export default function OfferApprovalsPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");

  const refresh = useCallback(async () => { setOffers(await getHrOffers()); }, []);
  useEffect(() => {
    let cancelled = false;

    async function loadInitialOffers() {
      try {
        const data = await getHrOffers();
        if (!cancelled) {
          setOffers(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialOffers();
    return () => { cancelled = true; };
  }, []);
  async function decide(id, action) {
    setBusy(id); setError("");
    try { await action(); await refresh(); setRejecting(null); setReason(""); }
    catch (e) { setError(e.message); }
    finally { setBusy(null); }
  }

  return <div>
    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600"><Sparkles size={12} />OFFER APPROVALS</div>
    <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Offers</h1>
    <p className="mt-2 text-neutral-500">Review offers submitted by recruiters from your company.</p>
    {error && <p role="alert" className="mt-5 flex gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={16} />{error}</p>}
    <div className="mt-8 overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30">
      {loading ? <p className="flex items-center gap-2 p-8 text-sm text-neutral-500"><Loader2 size={16} className="animate-spin" />Loading offers…</p>
        : offers.length === 0 ? <p className="p-10 text-center text-sm text-neutral-500">No offers submitted for approval.</p>
          : <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-400"><tr>
              {["Candidate", "Job", "Compensation", "Submitted by", "Status", "Actions"].map((label) => <th className="px-5 py-4 font-medium" key={label}>{label}</th>)}
            </tr></thead>
            <tbody>{offers.map((o) => <tr key={o.id} className="border-b border-neutral-100 last:border-0">
              <td className="px-5 py-4 font-semibold text-neutral-900"><BadgeCheck size={16} className="mr-2 inline text-emerald-600" />{o.candidate}</td>
              <td className="px-5 py-4 text-neutral-600">{o.job}</td>
              <td className="px-5 py-4 font-medium text-neutral-800">{o.currency} {Number(o.salary).toLocaleString()}<p className="text-xs font-normal text-neutral-400">Start {o.startDate}</p>{o.notes && <p className="mt-1 max-w-60 text-xs font-normal text-neutral-500">{o.notes}</p>}</td>
              <td className="px-5 py-4 text-neutral-600">{o.submittedBy}<p className="text-xs text-neutral-400">{o.submittedAt ? new Date(o.submittedAt).toLocaleDateString() : "—"}</p></td>
              <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[o.status] || "bg-neutral-100"}`}>{o.status}</span>{o.rejectionReason && <p className="mt-2 max-w-48 text-xs text-red-600">{o.rejectionReason}</p>}</td>
              <td className="px-5 py-4">{o.status === "Submitted" && <div className="flex gap-2">
                <button type="button" disabled={busy === o.id} title="Approve offer" aria-label="Approve offer" onClick={() => decide(o.id, () => approveOffer(o.id))} className="rounded-lg border border-emerald-200 p-2 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"><CheckCircle2 size={18} /></button>
                <button type="button" disabled={busy === o.id} title="Reject offer" aria-label="Reject offer" onClick={() => { setRejecting(o.id); setReason(""); }} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"><XCircle size={18} /></button>
              </div>}</td>
            </tr>)}</tbody>
          </table></div>}
    </div>
    {rejecting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onSubmit={(e) => { e.preventDefault(); if (reason.trim()) decide(rejecting, () => rejectOffer(rejecting, reason.trim())); }}>
        <h2 className="text-xl font-semibold">Reject offer</h2>
        <p className="mt-1 text-sm text-neutral-500">Explain your decision to the recruiter.</p>
        <textarea autoFocus className="mt-5 w-full rounded-xl border border-neutral-200 p-3 text-sm outline-none focus:border-emerald-400" rows={4} maxLength={1000} required value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2"><button type="button" disabled={Boolean(busy)} onClick={() => setRejecting(null)} className="rounded-xl border border-neutral-200 px-4 py-2 text-sm">Cancel</button>
          <button type="submit" disabled={Boolean(busy) || !reason.trim()} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Confirm rejection"}</button></div>
      </form>
    </div>}
  </div>;
}
