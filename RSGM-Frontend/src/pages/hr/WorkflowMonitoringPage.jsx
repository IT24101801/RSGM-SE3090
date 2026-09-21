import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { getHrWorkflows } from "../../services/hiringWorkflowService";

const HEALTH_CONFIG = {
  "on-track": {
    label: "On track",
    icon: CheckCircle2,
    style: "bg-emerald-50 text-emerald-600",
  },
  "at-risk": {
    label: "At risk",
    icon: Clock,
    style: "bg-amber-50 text-amber-600",
  },
  blocked: {
    label: "Blocked",
    icon: AlertTriangle,
    style: "bg-red-50 text-red-600",
  },
};

export default function WorkflowMonitoringPage() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getHrWorkflows()
      .then((data) => { if (!cancelled) setWorkflows(data ?? []); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        RECRUITMENT WORKFLOWS
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
        Workflow Monitoring
      </h1>
      <p className="mt-2 text-neutral-500">
        Track how each hiring pipeline is progressing and spot bottlenecks early.
      </p>

      {/* Error */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-10 flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 size={16} className="animate-spin" />
          Loading pipelines…
        </div>
      )}

      {/* Empty */}
      {!loading && !error && workflows.length === 0 && (
        <div className="mt-10 rounded-2xl border border-white/70 bg-white/75 p-10 text-center text-sm text-neutral-500 shadow-xl shadow-neutral-200/30">
          No active hiring pipelines found.
        </div>
      )}

      {/* Pipeline list */}
      {!loading && !error && workflows.length > 0 && (
        <div className="mt-8 space-y-3">
          {workflows.map((w) => {
            const health = HEALTH_CONFIG[w.health] ?? HEALTH_CONFIG["on-track"];
            return (
              <div
                key={w.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30"
              >
                <div>
                  <p className="font-medium text-neutral-900">{w.name}</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Current stage:{" "}
                    <span className="font-medium text-neutral-700">{w.stage}</span>
                    {" · "}
                    Open for {w.daysOpen} day{w.daysOpen !== 1 ? "s" : ""}
                    {" · "}
                    {w.activeApplications} active application
                    {w.activeApplications !== 1 ? "s" : ""}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 ${health.style}`}
                >
                  <health.icon size={13} />
                  {health.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}