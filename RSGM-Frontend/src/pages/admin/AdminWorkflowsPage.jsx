import { useMemo, useState } from "react";
import { AlertTriangle, RotateCcw, Sparkles, XCircle } from "lucide-react";

// TODO: replace with GET /api/admin/agent-workflows?status=failed
const MOCK_WORKFLOWS = [
  { id: "w1", name: "Resume Skill Extraction", candidate: "Daniel Ong", failedAt: "2026-09-12 08:21", reason: "Timeout calling embeddings API", retries: 2 },
  { id: "w2", name: "Job Description Parsing", candidate: "JD-2291", failedAt: "2026-09-11 22:05", reason: "Malformed JSON response from model", retries: 1 },
  { id: "w3", name: "Skill-Gap Match Scoring", candidate: "Aisha Rahman", failedAt: "2026-09-10 15:40", reason: "Rate limit exceeded", retries: 3 },
];

function AdminWorkflowsPage() {
  const [workflows, setWorkflows] = useState(MOCK_WORKFLOWS);
  const [retryingId, setRetryingId] = useState(null);

  const failedCount = useMemo(() => workflows.length, [workflows]);

  const handleRetry = (id) => {
    setRetryingId(id);
    // TODO: call POST /api/admin/agent-workflows/{id}/retry
    setTimeout(() => {
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      setRetryingId(null);
    }, 900);
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        AGENTIC AI MONITORING
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Failed Workflows</h1>
      <p className="mt-2 text-neutral-500">
        Review and retry Agentic AI workflows that failed during execution.
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
        <AlertTriangle size={15} className="text-amber-500" />
        {failedCount} workflow{failedCount !== 1 ? "s" : ""} need attention
      </div>

      <div className="mt-4 space-y-3">
        {workflows.map((w) => (
          <div
            key={w.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-red-100 bg-red-50/40 backdrop-blur-xl"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <XCircle size={16} className="text-red-500" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900">{w.name}</p>
                <p className="mt-1 text-sm text-neutral-500 truncate">
                  {w.candidate} · {w.reason}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Failed {w.failedAt} · {w.retries} retr{w.retries === 1 ? "y" : "ies"} attempted
                </p>
              </div>
            </div>

            <button
              onClick={() => handleRetry(w.id)}
              disabled={retryingId === w.id}
              className="h-10 px-4 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60 shrink-0"
            >
              <RotateCcw size={14} className={retryingId === w.id ? "animate-spin" : ""} />
              {retryingId === w.id ? "Retrying..." : "Retry"}
            </button>
          </div>
        ))}

        {workflows.length === 0 && (
          <div className="py-16 text-center text-sm text-neutral-400 rounded-2xl border border-neutral-200 bg-white">
            No failed workflows right now. 🎉
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminWorkflowsPage;