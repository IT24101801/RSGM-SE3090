import { useState } from "react";
import {
  Loader2, ScanSearch, Sparkles, Star,
} from "lucide-react";

// TODO: replace with GET /api/recruiter/postings (for the dropdown)
const JOB_POSTINGS = [
  { id: "p1", title: "Senior Frontend Engineer" },
  { id: "p2", title: "Product Designer" },
  { id: "p4", title: "Backend Engineer" },
];

// TODO: replace with POST /api/recruiter/matching/run { jobId }
const MOCK_RESULTS = {
  p1: [
    { id: "c1", name: "Aisha Rahman", matchScore: 92, matchedSkills: ["React", "TypeScript", "Tailwind CSS"], gapSkills: ["GraphQL"] },
    { id: "c2", name: "Grace Lim", matchScore: 81, matchedSkills: ["React", "JavaScript"], gapSkills: ["TypeScript", "Testing"] },
    { id: "c3", name: "Daniel Ong", matchScore: 67, matchedSkills: ["JavaScript", "CSS"], gapSkills: ["React", "TypeScript"] },
  ],
  p2: [
    { id: "c4", name: "Marcus Tan", matchScore: 88, matchedSkills: ["Figma", "Design Systems"], gapSkills: ["User Research"] },
  ],
  p4: [
    { id: "c5", name: "Priya Nair", matchScore: 79, matchedSkills: ["Node.js", "PostgreSQL"], gapSkills: ["Kubernetes"] },
  ],
};

function CandidateMatchingPage() {
  const [selectedJob, setSelectedJob] = useState(JOB_POSTINGS[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const runMatching = () => {
    setIsRunning(true);
    setResults(null);
    // TODO: call POST /api/recruiter/matching/run
    setTimeout(() => {
      setResults(MOCK_RESULTS[selectedJob] ?? []);
      setIsRunning(false);
    }, 1200);
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        AI CANDIDATE MATCHING
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Candidate Matching</h1>
      <p className="mt-2 text-neutral-500">
        Run the skill-matching engine against a job posting to get ranked candidates.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <select
          value={selectedJob}
          onChange={(e) => { setSelectedJob(e.target.value); setResults(null); }}
          className="h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
        >
          {JOB_POSTINGS.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>

        <button
          onClick={runMatching}
          disabled={isRunning}
          className="h-12 px-5 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60"
        >
          {isRunning ? <Loader2 size={16} className="animate-spin" /> : <ScanSearch size={16} />}
          {isRunning ? "Running match..." : "Run matching"}
        </button>
      </div>

      {results && (
        <div className="mt-8 space-y-4">
          {results.map((c, index) => (
            <div
              key={c.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold shrink-0">
                  #{index + 1}
                </div>

                <div>
                  <p className="font-medium text-neutral-900">{c.name}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {c.matchedSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-medium">
                        {s}
                      </span>
                    ))}
                    {c.gapSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 text-[11px] font-medium">
                        Gap: {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span className="text-lg font-semibold">{c.matchScore}%</span>
                <span className="text-xs text-neutral-400">match</span>
              </div>
            </div>
          ))}

          {results.length === 0 && (
            <div className="py-16 text-center text-sm text-neutral-400 rounded-2xl border border-neutral-200 bg-white">
              No candidates found for this posting yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CandidateMatchingPage;