import { useState } from "react";
import { AlertCircle, Loader2, Star, X } from "lucide-react";

const CRITERIA = [
  { key: "technicalSkills", label: "Technical skills" },
  { key: "problemSolving", label: "Problem solving" },
  { key: "communication", label: "Communication" },
  { key: "cultureFit", label: "Culture fit" },
];

const RECOMMENDATIONS = ["Strong Hire", "Hire", "Leaning No", "No Hire"];

function FeedbackModal({ interview, onClose, onSubmit }) {
  const [ratings, setRatings] = useState(
    Object.fromEntries(CRITERIA.map((c) => [c.key, 0]))
  );
  const [recommendation, setRecommendation] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const setRating = (key, value) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const hasAllRatings = CRITERIA.every((c) => ratings[c.key] > 0);
    if (!hasAllRatings) {
      setError("Please rate every criterion before submitting.");
      return;
    }
    if (!recommendation) {
      setError("Please select a recommendation.");
      return;
    }

    setIsSaving(true);
    // TODO: POST /api/panelist/interviews/{id}/feedback { ratings, recommendation, comments }
    setTimeout(() => {
      onSubmit({ ratings, recommendation, comments });
      setIsSaving(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/70 bg-white shadow-2xl p-6 sm:p-8">
        <button onClick={onClose} className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-700 transition">
          <X size={18} />
        </button>

        <h2 className="text-2xl font-semibold tracking-tight">Interview feedback</h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          {interview.candidate} · {interview.job}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {CRITERIA.map((c) => (
            <div key={c.key}>
              <label className="block text-sm font-medium text-neutral-700 mb-2">{c.label}</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(c.key, n)}
                    className="p-0.5"
                  >
                    <Star
                      size={24}
                      className={n <= ratings[c.key] ? "text-amber-400 fill-amber-400" : "text-neutral-200"}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Recommendation</label>
            <div className="grid grid-cols-2 gap-2">
              {RECOMMENDATIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRecommendation(r)}
                  className={`h-11 rounded-xl border text-sm font-semibold transition ${
                    recommendation === r
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Comments <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="Notes on strengths, concerns, or standout moments..."
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-sm outline-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 h-12 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition disabled:opacity-60"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              Submit feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FeedbackModal;