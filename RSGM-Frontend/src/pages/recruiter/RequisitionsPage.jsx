import { useState } from "react";
import {
  AlertCircle,
  Loader2,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

// TODO: replace with GET/POST /api/recruiter/requisitions
const INITIAL_REQUISITIONS = [
  { id: "r1", title: "Senior Frontend Engineer", department: "Engineering", headcount: 2, status: "Open", createdAt: "2026-08-28" },
  { id: "r2", title: "Product Designer", department: "Design", headcount: 1, status: "Open", createdAt: "2026-09-01" },
  { id: "r3", title: "Data Analyst", department: "Analytics", headcount: 1, status: "Pending Approval", createdAt: "2026-09-05" },
  { id: "r4", title: "Backend Engineer", department: "Engineering", headcount: 3, status: "Closed", createdAt: "2026-07-14" },
];

const STATUS_STYLES = {
  Open: "bg-emerald-50 text-emerald-600",
  "Pending Approval": "bg-amber-50 text-amber-600",
  Closed: "bg-neutral-100 text-neutral-500",
};

function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState(INITIAL_REQUISITIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (newReq) => {
    setRequisitions((prev) => [
      { ...newReq, id: crypto.randomUUID(), status: "Pending Approval", createdAt: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
            <Sparkles size={12} />
            HIRING REQUISITIONS
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Requisitions</h1>
          <p className="mt-2 text-neutral-500">
            Raise a new hiring request and track approval status.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-12 px-5 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition shrink-0"
        >
          <Plus size={16} />
          New requisition
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200/70 text-left text-xs text-neutral-400 uppercase tracking-wide">
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Department</th>
                <th className="px-6 py-4 font-medium">Headcount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/70 transition">
                  <td className="px-6 py-4 font-medium text-neutral-900">{r.title}</td>
                  <td className="px-6 py-4 text-neutral-500">{r.department}</td>
                  <td className="px-6 py-4 text-neutral-500">{r.headcount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">{r.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <RequisitionModal onClose={() => setIsModalOpen(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}

function RequisitionModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [headcount, setHeadcount] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !department.trim()) {
      setError("Please fill in the title and department.");
      return;
    }

    setIsSaving(true);
    // TODO: POST /api/recruiter/requisitions
    setTimeout(() => {
      onSubmit({ title: title.trim(), department: department.trim(), headcount, notes });
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white shadow-2xl p-6 sm:p-8">
        <button onClick={onClose} className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-700 transition">
          <X size={18} />
        </button>

        <h2 className="text-2xl font-semibold tracking-tight">New requisition</h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          Submit a hiring request for approval.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Job title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
            />
          </Field>

          <Field label="Department">
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Engineering"
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
            />
          </Field>

          <Field label="Headcount">
            <input
              type="number"
              min={1}
              value={headcount}
              onChange={(e) => setHeadcount(Number(e.target.value))}
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
            />
          </Field>

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Justification, budget notes, etc."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition resize-none"
            />
          </Field>

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
              className="flex-1 h-12 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Submit for approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

export default RequisitionsPage;