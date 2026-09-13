import { useState } from "react";
import {
  Ban, CircleCheck, Eye, Plus, Sparkles,
} from "lucide-react";

// TODO: replace with GET /api/recruiter/postings, PATCH /api/recruiter/postings/{id}/status
const INITIAL_POSTINGS = [
  { id: "p1", title: "Senior Frontend Engineer", location: "Remote", applicants: 24, status: "Published" },
  { id: "p2", title: "Product Designer", location: "Singapore", applicants: 12, status: "Published" },
  { id: "p3", title: "Data Analyst", location: "Singapore", applicants: 0, status: "Draft" },
  { id: "p4", title: "Backend Engineer", location: "Remote", applicants: 31, status: "Closed" },
];

const STATUS_STYLES = {
  Published: "bg-emerald-50 text-emerald-600",
  Draft: "bg-neutral-100 text-neutral-500",
  Closed: "bg-red-50 text-red-600",
};

function JobPostingsPage() {
  const [postings, setPostings] = useState(INITIAL_POSTINGS);

  const toggleStatus = (id) => {
    setPostings((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        if (p.status === "Draft") return { ...p, status: "Published" };
        if (p.status === "Published") return { ...p, status: "Closed" };
        return p;
      })
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
            <Sparkles size={12} />
            JOB POSTINGS
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Job Postings</h1>
          <p className="mt-2 text-neutral-500">
            Publish approved requisitions and track applicant volume.
          </p>
        </div>

        <button className="h-12 px-5 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition shrink-0">
          <Plus size={16} />
          New posting
        </button>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-5">
        {postings.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-neutral-900">{p.title}</p>
                <p className="mt-1 text-sm text-neutral-500">{p.location}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${STATUS_STYLES[p.status]}`}>
                {p.status}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
              <Eye size={14} />
              {p.applicants} applicant{p.applicants !== 1 ? "s" : ""}
            </div>

            <div className="mt-5 flex items-center gap-2">
              {p.status !== "Closed" && (
                <button
                  onClick={() => toggleStatus(p.id)}
                  className="h-10 px-4 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition flex items-center gap-2"
                >
                  {p.status === "Draft" ? (
                    <>
                      <CircleCheck size={14} />
                      Publish
                    </>
                  ) : (
                    <>
                      <Ban size={14} />
                      Close
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobPostingsPage;