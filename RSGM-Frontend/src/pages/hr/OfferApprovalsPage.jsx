import { useState } from "react";
import {
  AlertCircle, BadgeCheck, CheckCircle2, Loader2, Sparkles, X, XCircle,
} from "lucide-react";

// TODO: replace with GET /api/hr/offers?status=pending, POST /api/hr/offers/{id}/decision
const INITIAL_OFFERS = [
  { id: "o1", candidate: "Aisha Rahman", job: "Senior Frontend Engineer", salary: "$118,000 / yr", submittedBy: "Marcus Tan", submittedAt: "2026-09-11", status: "Pending" },
  { id: "o2", candidate: "Marcus Tan", job: "Product Designer", salary: "$96,000 / yr", submittedBy: "Marcus Tan", submittedAt: "2026-09-09", status: "Pending" },
  { id: "o3", candidate: "Priya Nair", job: "Backend Engineer", salary: "$104,000 / yr", submittedBy: "Marcus Tan", submittedAt: "2026-09-03", status: "Approved" },
];

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-600",
  Approved: "bg-emerald-50 text-emerald-600",
  Rejected: "bg-red-50 text-red-600",
};

function OfferApprovalsPage() {
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [rejecting, setRejecting] = useState(null);

  const approve = (id) => {
    // TODO: POST /api/hr/offers/{id}/decision { decision: "Approved" }
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status: "Approved" } : o)));
  };

  const reject = (id, reason) => {
    // TODO: POST /api/hr/offers/{id}/decision { decision: "Rejected", reason }
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status: "Rejected", rejectionReason: reason } : o)));
    setRejecting(null);
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        OFFER APPROVALS
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Offers</h1>
      <p className="mt-2 text-neutral-500">
        Sign off on compensation offers before they go out to candidates.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200/70 text-left text-xs text-neutral-400 uppercase tracking-wide">
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Job</th>
                <th className="px-6 py-4 font-medium">Offer</th>
                <th className="px-6 py-4 font-medium">Submitted</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <BadgeCheck size={15} className="text-emerald-600" />
                      </div>
                      <span className="font-medium text-neutral-900">{o.candidate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">{o.job}</td>
                  <td className="px-6 py-4 text-neutral-700 font-medium">{o.salary}</td>
                  <td className="px-6 py-4 text-neutral-500">{o.submittedAt}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[o.status]}`}>
                      {o.status}
                    </span>
                    {o.status === "Rejected" && o.rejectionReason && (
                      <p className="mt-1 text-xs text-red-500 max-w-40">{o.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {o.status === "Pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => approve(o.id)}
                          className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition"
                          title="Approve"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                        <button
                          onClick={() => setRejecting(o.id)}
                          className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                          title="Reject"
                        >
                          <XCircle size={15} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 block text-right">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rejecting && (
        <RejectModal onClose={() => setRejecting(null)} onSubmit={(reason) => reject(rejecting, reason)} />
      )}
    </div>
  );
}

function RejectModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }
    setIsSaving(true);
    setTimeout(() => onSubmit(reason.trim()), 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white shadow-2xl p-6 sm:p-8">
        <button onClick={onClose} className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-700 transition">
          <X size={18} />
        </button>

        <h2 className="text-2xl font-semibold tracking-tight">Reject offer</h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          Let the recruiter know why this offer wasn't approved.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="e.g. Salary exceeds approved band for this level"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition resize-none"
          />

          {error && (
            <div className="flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-12 rounded-xl bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-700 active:scale-[0.99] transition disabled:opacity-60"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Confirm rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OfferApprovalsPage;