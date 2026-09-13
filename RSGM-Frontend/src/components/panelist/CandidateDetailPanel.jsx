import { Briefcase, FileText, MapPin, Star, X } from "lucide-react";

function CandidateDetailPanel({ interview, onClose, onGiveFeedback }) {
  const { candidate } = interview;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/70 bg-white shadow-2xl p-6 sm:p-8">
        <button onClick={onClose} className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-700 transition">
          <X size={18} />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-lg font-semibold shrink-0">
            {candidate.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{candidate.name}</h2>
            <p className="mt-0.5 text-sm text-neutral-500 flex items-center gap-1.5">
              <MapPin size={13} />
              {candidate.location}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold">
            <Star size={14} className="fill-amber-500 text-amber-500" />
            {candidate.matchScore}% match
          </div>
          <div className="flex items-center gap-1.5 text-sm text-neutral-500">
            <Briefcase size={14} />
            Applying for {interview.job}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-neutral-700">Summary</h3>
          <p className="mt-2 text-sm text-neutral-600">{candidate.summary}</p>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-neutral-700">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {candidate.skills.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-neutral-700">Experience</h3>
          <ul className="mt-2 space-y-2">
            {candidate.experience.map((e) => (
              <li key={e.company} className="text-sm text-neutral-600">
                <span className="font-medium text-neutral-900">{e.title}</span> at {e.company} · {e.duration}
              </li>
            ))}
          </ul>
        </div>

        {candidate.cvFileName && (
          <div className="mt-6 flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50/60">
            <FileText size={17} className="text-amber-600 shrink-0" />
            <span className="text-sm text-neutral-700 truncate">{candidate.cvFileName}</span>
          </div>
        )}

        <button
          onClick={onGiveFeedback}
          className="mt-7 w-full h-12 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 active:scale-[0.99] transition"
        >
          {interview.feedbackSubmitted ? "View / edit feedback" : "Submit feedback"}
        </button>
      </div>
    </div>
  );
}

export default CandidateDetailPanel;