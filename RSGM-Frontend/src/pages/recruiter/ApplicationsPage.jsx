import { useMemo, useState } from "react";
import { CircleCheck, CircleX, Search, Sparkles } from "lucide-react";

// TODO: replace with GET /api/recruiter/applications
const INITIAL_APPLICATIONS = [
  { id: "a1", candidate: "Aisha Rahman", job: "Senior Frontend Engineer", appliedAt: "2026-09-10", status: "Under Review" },
  { id: "a2", candidate: "Marcus Tan", job: "Product Designer", appliedAt: "2026-09-09", status: "Shortlisted" },
  { id: "a3", candidate: "Grace Lim", job: "Senior Frontend Engineer", appliedAt: "2026-09-08", status: "Rejected" },
  { id: "a4", candidate: "Daniel Ong", job: "Data Analyst", appliedAt: "2026-09-07", status: "Under Review" },
  { id: "a5", candidate: "Priya Nair", job: "Backend Engineer", appliedAt: "2026-09-05", status: "Shortlisted" },
];

const STATUS_STYLES = {
  "Under Review": "bg-amber-50 text-amber-600",
  Shortlisted: "bg-emerald-50 text-emerald-600",
  Rejected: "bg-red-50 text-red-600",
};

function ApplicationsPage() {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return applications.filter(
      (a) =>
        a.candidate.toLowerCase().includes(query.toLowerCase()) ||
        a.job.toLowerCase().includes(query.toLowerCase())
    );
  }, [applications, query]);

  const setStatus = (id, status) => {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        APPLICATION REVIEW
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Applications</h1>
      <p className="mt-2 text-neutral-500">
        Review candidate applications and move them forward or reject.
      </p>

      <div className="relative mt-8 max-w-sm">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search candidate or job..."
          className="w-full h-11 rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200/70 text-left text-xs text-neutral-400 uppercase tracking-wide">
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Job</th>
                <th className="px-6 py-4 font-medium">Applied</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/70 transition">
                  <td className="px-6 py-4 font-medium text-neutral-900">{a.candidate}</td>
                  <td className="px-6 py-4 text-neutral-500">{a.job}</td>
                  <td className="px-6 py-4 text-neutral-500">{a.appliedAt}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setStatus(a.id, "Shortlisted")}
                        disabled={a.status === "Shortlisted"}
                        className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition disabled:opacity-40"
                        title="Shortlist"
                      >
                        <CircleCheck size={15} />
                      </button>
                      <button
                        onClick={() => setStatus(a.id, "Rejected")}
                        disabled={a.status === "Rejected"}
                        className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-40"
                        title="Reject"
                      >
                        <CircleX size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-sm text-neutral-400">
                    No applications match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ApplicationsPage;