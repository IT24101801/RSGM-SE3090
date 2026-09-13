import { useMemo, useState } from "react";
import { FileClock, Search, ShieldAlert, Sparkles } from "lucide-react";

// TODO: replace with GET /api/admin/audit-logs
const MOCK_LOGS = [
  { id: "l1", actor: "grace@example.com", action: "Deactivated skill", target: "GraphQL", timestamp: "2026-09-12 09:14", severity: "info" },
  { id: "l2", actor: "grace@example.com", action: "Changed user role", target: "priya@example.com → HRManager", timestamp: "2026-09-11 17:02", severity: "warning" },
  { id: "l3", actor: "system", action: "Failed login attempts (5x)", target: "unknown@mailinator.com", timestamp: "2026-09-11 13:45", severity: "critical" },
  { id: "l4", actor: "grace@example.com", action: "Created skill", target: "Kubernetes", timestamp: "2026-09-10 11:30", severity: "info" },
  { id: "l5", actor: "grace@example.com", action: "Deactivated user", target: "priya@example.com", timestamp: "2026-09-09 08:10", severity: "warning" },
];

const SEVERITY_STYLES = {
  info: "bg-blue-50 text-blue-600",
  warning: "bg-amber-50 text-amber-600",
  critical: "bg-red-50 text-red-600",
};

function AdminAuditLogsPage() {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("All");

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter((log) => {
      const matchesQuery =
        log.actor.toLowerCase().includes(query.toLowerCase()) ||
        log.action.toLowerCase().includes(query.toLowerCase()) ||
        log.target.toLowerCase().includes(query.toLowerCase());
      const matchesSeverity = severity === "All" || log.severity === severity;
      return matchesQuery && matchesSeverity;
    });
  }, [query, severity]);

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        AUDIT TRAIL
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Audit Logs</h1>
      <p className="mt-2 text-neutral-500">
        Track admin actions and system events across the platform.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm w-full">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search logs..."
            className="w-full h-11 rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
          />
        </div>

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="h-11 rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
        >
          <option value="All">All severities</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-4 p-4 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-xl shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
              {log.severity === "critical" ? (
                <ShieldAlert size={16} className="text-red-500" />
              ) : (
                <FileClock size={16} className="text-neutral-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-neutral-900">{log.action}</p>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${SEVERITY_STYLES[log.severity]}`}>
                  {log.severity}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500 truncate">{log.target}</p>
              <p className="mt-1 text-xs text-neutral-400">
                {log.actor} · {log.timestamp}
              </p>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="py-16 text-center text-sm text-neutral-400 rounded-2xl border border-neutral-200 bg-white">
            No log entries match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAuditLogsPage;