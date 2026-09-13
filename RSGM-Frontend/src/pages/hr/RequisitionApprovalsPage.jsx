import { useState } from "react";
import {
  AlertCircle, CheckCircle2, ClipboardList, Loader2, Sparkles, X, XCircle,
} from "lucide-react";

// TODO: replace with GET /api/hr/requisitions?status=pending, POST /api/hr/requisitions/{id}/decision
const INITIAL_REQUISITIONS = [
  { id: "r1", title: "Senior Frontend Engineer", department: "Engineering", headcount: 2, requestedBy: "Marcus Tan", submittedAt: "2026-09-10", justification: "Backlog growth on core product surfaces requires two more senior engineers this quarter.", status: "Pending" },
  { id: "r2", title: "Product Designer", department: "Design", headcount: 1, requestedBy: "Marcus Tan", submittedAt: "2026-09-08", justification: "Design team is stretched across three concurrent launches.", status: "Pending" },
  { id: "r3", title: "Data Analyst", department: "Analytics", headcount: 1, requestedBy: "Marcus Tan", submittedAt: "2026-09-05", justification: "New analytics function to support pricing decisions.", status: "Approved" },
];

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-600",
  Approved: "bg-emerald-50 text-emerald-600",
  Rejected: "bg-red-50 text-red-600",
};

function RequisitionApprovalsPage() {
  const [requisitions, setRequisitions] = useState(INITIAL_REQUISITIONS);
  const [rejecting, setRejecting] = useState(null);

  const approve = (id) => {
    // TODO: POST /api/hr/requisitions/{id}/decision { decision: "Approved" }
    setRequisitions((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
  };

  const reject = (id, reason) => {
    // TODO: POST /api/hr/requisitions/{id}/decision { decision: "Rejected", reason }
    setRequisitions((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected", rejectionReason: reason } : r)));
    setRejecting(null);
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        REQUISITION APPROVALS
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Requisitions</h1>
      <p className="mt-2 text-neutral-500">
        Approve or reject hiring requests submitted by recruiters.
      </p>

      <div className="mt-8 space-y-4">
        {requisitions.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <ClipboardList size={20} className="text-emerald-600" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-neutral-900">{r.title}</p>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    {r.department} · {r.headcount} headcount · requested by {r.requestedBy} on {r.submittedAt}
                  </p>
                  <p className="mt-2.5 text-sm text-neutral-600 max-w-xl">{r.justification}</p>
                  {r.status === "Rejected" && r.rejectionReason && (
                    <p className="mt-2 text-sm text-red-600">Reason: {r.rejectionReason}</p>
                  )}
                </div>
              </div>

              {r.status === "Pending" && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => approve(r.id)}
                    className="h-10 px-4 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition"
                  >
                    <CheckCircle2 size={14} />
                    Approve
                  </button>
                  <button
                    onClick={() => setRejecting(r.id)}
                    className="h-10 px-4 rounded-xl border border-red-200 text-red-600 text-sm font-semibold flex items-center gap-2 hover:bg-red-50 transition"
                  >
                    <XCircle size={14} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
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

        <h2 className="text-2xl font-semibold tracking-tight">Reject requisition</h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          Let the recruiter know why this request wasn't approved.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="e.g. Budget not approved for this quarter"
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

export default RequisitionApprovalsPage;