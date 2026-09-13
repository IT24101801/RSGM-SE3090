import { AlertTriangle, CheckCircle2, Clock, Sparkles } from "lucide-react";

// TODO: replace with GET /api/hr/workflows
const WORKFLOWS = [
  { id: "w1", name: "Senior Frontend Engineer — Hiring Pipeline", stage: "Interviewing", health: "on-track", daysOpen: 14 },
  { id: "w2", name: "Product Designer — Hiring Pipeline", stage: "Offer Stage", health: "on-track", daysOpen: 21 },
  { id: "w3", name: "Backend Engineer — Hiring Pipeline", stage: "Candidate Matching", health: "at-risk", daysOpen: 38 },
  { id: "w4", name: "Data Analyst — Hiring Pipeline", stage: "Requisition Review", health: "blocked", daysOpen: 9 },
];

const HEALTH_CONFIG = {
  "on-track": { label: "On track", icon: CheckCircle2, style: "bg-emerald-50 text-emerald-600" },
  "at-risk": { label: "At risk", icon: Clock, style: "bg-amber-50 text-amber-600" },
  blocked: { label: "Blocked", icon: AlertTriangle, style: "bg-red-50 text-red-600" },
};

function WorkflowMonitoringPage() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        RECRUITMENT WORKFLOWS
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Workflow Monitoring</h1>
      <p className="mt-2 text-neutral-500">
        Track how each hiring pipeline is progressing and spot bottlenecks early.
      </p>

      <div className="mt-8 space-y-3">
        {WORKFLOWS.map((w) => {
          const health = HEALTH_CONFIG[w.health];
          return (
            <div
              key={w.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30"
            >
              <div>
                <p className="font-medium text-neutral-900">{w.name}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Current stage: {w.stage} · Open for {w.daysOpen} days
                </p>
              </div>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${health.style}`}>
                <health.icon size={13} />
                {health.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WorkflowMonitoringPage;