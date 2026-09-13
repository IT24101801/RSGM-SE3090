import { useState } from "react";
import {
  Briefcase, Loader2, Sparkles, Star, TriangleAlert, X,
} from "lucide-react";

// TODO: replace with GET /api/jobseeker/applications, DELETE /api/jobseeker/applications/{id}
const INITIAL_APPLICATIONS = [
  {
    id: "a1",
    job: "Senior Frontend Engineer",
    company: "RSGM Inc.",
    appliedAt: "2026-09-10",
    status: "Under Review",
    matchScore: 92,
    matchedSkills: ["React", "TypeScript", "Tailwind CSS"],
    gapSkills: ["GraphQL"],
  },
  {
    id: "a2",
    job: "Frontend Developer",
    company: "BrightPath",
    appliedAt: "2026-09-08",
    status: "Shortlisted",
    matchScore: 78,
    matchedSkills: ["React", "JavaScript"],
    gapSkills: ["CSS Architecture", "Testing"],
  },
  {
    id: "a3",
    job: "UI Engineer",
    company: "Northwind",
    appliedAt: "2026-08-30",
    status: "Rejected",
    matchScore: 65,
    matchedSkills: ["React"],
    gapSkills: ["Design Systems", "Figma"],
  },
];

const STATUS_STEPS = ["Under Review", "Shortlisted", "Interview", "Offer"];

const STATUS_STYLES = {
  "Under Review": "bg-amber-50 text-amber-600",
  Shortlisted: "bg-emerald-50 text-emerald-600",
  Interview: "bg-blue-50 text-blue-600",
  Offer: "bg-violet-50 text-violet-600",
  Rejected: "bg-red-50 text-red-600",
};

function MyApplicationsPage() {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [withdrawing, setWithdrawing] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const confirmWithdraw = () => {
    setIsWithdrawing(true);
    // TODO: DELETE /api/jobseeker/applications/{id}
    setTimeout(() => {
      setApplications((prev) => prev.filter((a) => a.id !== withdrawing));
      setWithdrawing(null);
      setIsWithdrawing(false);
    }, 500);
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        MY APPLICATIONS
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Applications</h1>
      <p className="mt-2 text-neutral-500">
        Track your progress and see exactly what's helping — or hurting — your match score.
      </p>

      <div className="mt-8 space-y-5">
        {applications.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                  <Briefcase size={20} className="text-violet-600" />
                </div>

                <div>
                  <p className="font-semibold text-neutral-900">{a.job}</p>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    {a.company} · Applied {a.appliedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Star size={15} className="text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold">{a.matchScore}%</span>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                  {a.status}
                </span>
              </div>
            </div>

            {/* PROGRESS TRACKER */}

            {a.status !== "Rejected" && (
              <div className="mt-5 flex items-center">
                {STATUS_STEPS.map((step, i) => {
                  const currentIndex = STATUS_STEPS.indexOf(a.status);
                  const isDone = i <= currentIndex;
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full ${isDone ? "bg-violet-600" : "bg-neutral-200"}`} />
                        <span className={`text-[11px] font-medium ${isDone ? "text-neutral-700" : "text-neutral-400"}`}>
                          {step}
                        </span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1.5 mb-4 ${i < currentIndex ? "bg-violet-600" : "bg-neutral-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* SKILL-GAP FEEDBACK */}

            <div className="mt-5 flex flex-wrap gap-1.5">
              {a.matchedSkills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-medium">
                  {s}
                </span>
              ))}
              {a.gapSkills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 text-[11px] font-medium">
                  Gap: {s}
                </span>
              ))}
            </div>

            {a.status !== "Rejected" && (
              <div className="mt-5">
                <button
                  onClick={() => setWithdrawing(a.id)}
                  className="h-9 px-4 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition"
                >
                  Withdraw application
                </button>
              </div>
            )}
          </div>
        ))}

        {applications.length === 0 && (
          <div className="py-16 text-center text-sm text-neutral-400 rounded-2xl border border-neutral-200 bg-white">
            You haven't applied to any jobs yet.
          </div>
        )}
      </div>

      {withdrawing && (
        <WithdrawConfirm
          isLoading={isWithdrawing}
          onConfirm={confirmWithdraw}
          onClose={() => setWithdrawing(null)}
        />
      )}
    </div>
  );
}

function WithdrawConfirm({ isLoading, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-3xl border border-white/70 bg-white shadow-2xl p-6 sm:p-7">
        <button onClick={onClose} className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-700 transition">
          <X size={18} />
        </button>

        <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center">
          <TriangleAlert size={20} className="text-red-500" />
        </div>

        <h2 className="mt-4 text-lg font-semibold tracking-tight">Withdraw this application?</h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          This can't be undone. You'll need to reapply if you change your mind.
        </p>

        <div className="flex items-center gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-700 active:scale-[0.99] transition disabled:opacity-60"
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyApplicationsPage;