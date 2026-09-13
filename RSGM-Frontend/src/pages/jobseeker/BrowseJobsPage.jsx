import { useMemo, useState } from "react";
import {
  Briefcase, CheckCircle2, MapPin, Search, Sparkles, Star,
} from "lucide-react";

// TODO: replace with GET /api/jobseeker/jobs
const JOBS = [
  { id: "p1", title: "Senior Frontend Engineer", company: "RSGM Inc.", location: "Remote", matchScore: 92, skills: ["React", "TypeScript", "Tailwind CSS"], applied: false },
  { id: "p2", title: "Frontend Developer", company: "BrightPath", location: "Singapore", matchScore: 78, skills: ["React", "JavaScript", "CSS"], applied: true },
  { id: "p4", title: "Backend Engineer", company: "RSGM Inc.", location: "Remote", matchScore: 54, skills: ["Node.js", "PostgreSQL"], applied: false },
  { id: "p5", title: "UI Engineer", company: "Northwind", location: "Singapore", matchScore: 85, skills: ["React", "Design Systems"], applied: false },
];

function BrowseJobsPage() {
  const [jobs, setJobs] = useState(JOBS);
  const [query, setQuery] = useState("");

  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(query.toLowerCase()) ||
        j.company.toLowerCase().includes(query.toLowerCase())
    );
  }, [jobs, query]);

  const applyToJob = (id) => {
    // TODO: POST /api/jobseeker/applications { jobId: id }
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, applied: true } : j)));
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        BROWSE JOBS
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Jobs for you</h1>
      <p className="mt-2 text-neutral-500">
        Ranked by how well your skills match each role.
      </p>

      <div className="relative mt-8 max-w-sm">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs or companies..."
          className="w-full h-11 rounded-xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition"
        />
      </div>

      <div className="mt-6 space-y-4">
        {filteredJobs.map((j) => (
          <div
            key={j.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30"
          >
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                <Briefcase size={20} className="text-violet-600" />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-neutral-900">{j.title}</p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {j.company} · <span className="inline-flex items-center gap-1"><MapPin size={12} />{j.location}</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {j.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-1.5">
                <Star size={15} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold">{j.matchScore}%</span>
              </div>

              {j.applied ? (
                <span className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-emerald-50 text-emerald-600 text-sm font-semibold">
                  <CheckCircle2 size={14} />
                  Applied
                </span>
              ) : (
                <button
                  onClick={() => applyToJob(j.id)}
                  className="h-10 px-4 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 active:scale-[0.99] transition"
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="py-16 text-center text-sm text-neutral-400 rounded-2xl border border-neutral-200 bg-white">
            No jobs match your search.
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseJobsPage;