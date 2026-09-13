import { useState } from "react";
import { CheckCircle2, Lock, Sparkles, Star } from "lucide-react";

// TODO: replace with GET /api/recruiter/shortlists, POST /api/recruiter/shortlists/{id}/finalize
const INITIAL_SHORTLISTS = [
  {
    id: "s1",
    job: "Senior Frontend Engineer",
    finalized: false,
    candidates: [
      { id: "c1", name: "Aisha Rahman", matchScore: 92, approved: true },
      { id: "c2", name: "Grace Lim", matchScore: 81, approved: false },
    ],
  },
  {
    id: "s2",
    job: "Product Designer",
    finalized: true,
    candidates: [
      { id: "c4", name: "Marcus Tan", matchScore: 88, approved: true },
    ],
  },
];

function ShortlistsPage() {
  const [shortlists, setShortlists] = useState(INITIAL_SHORTLISTS);

  const toggleApprove = (shortlistId, candidateId) => {
    setShortlists((prev) =>
      prev.map((s) =>
        s.id !== shortlistId
          ? s
          : {
              ...s,
              candidates: s.candidates.map((c) =>
                c.id === candidateId ? { ...c, approved: !c.approved } : c
              ),
            }
      )
    );
  };

  const finalize = (shortlistId) => {
    // TODO: POST /api/recruiter/shortlists/{id}/finalize
    setShortlists((prev) =>
      prev.map((s) => (s.id === shortlistId ? { ...s, finalized: true } : s))
    );
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        SHORTLIST APPROVAL
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Shortlists</h1>
      <p className="mt-2 text-neutral-500">
        Approve candidates from the ranked matches and finalize each shortlist.
      </p>

      <div className="mt-8 space-y-6">
        {shortlists.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30 p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold tracking-tight">{s.job}</h2>

              {s.finalized ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-500 text-xs font-medium">
                  <Lock size={12} />
                  Finalized
                </span>
              ) : (
                <button
                  onClick={() => finalize(s.id)}
                  disabled={!s.candidates.some((c) => c.approved)}
                  className="h-10 px-4 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-50"
                >
                  <CheckCircle2 size={14} />
                  Finalize shortlist
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2.5">
              {s.candidates.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-center justify-between gap-4 p-3.5 rounded-xl border transition ${
                    c.approved ? "border-emerald-200 bg-emerald-50/50" : "border-neutral-200 bg-neutral-50/50"
                  } ${s.finalized ? "opacity-70" : "cursor-pointer hover:bg-neutral-100/70"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={c.approved}
                      disabled={s.finalized}
                      onChange={() => toggleApprove(s.id, c.id)}
                      className="w-4 h-4 accent-neutral-900"
                    />
                    <span className="text-sm font-medium text-neutral-900">{c.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    {c.matchScore}%
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShortlistsPage;