import { useState } from "react";
import {
  AlertCircle, CalendarClock, Loader2, Plus, Sparkles, X,
} from "lucide-react";

// TODO: replace with GET/POST /api/recruiter/interviews
const INITIAL_INTERVIEWS = [
  { id: "i1", candidate: "Aisha Rahman", job: "Senior Frontend Engineer", date: "2026-09-13", time: "10:00 AM", type: "Technical" },
  { id: "i2", candidate: "Marcus Tan", job: "Product Designer", date: "2026-09-14", time: "2:30 PM", type: "Portfolio Review" },
];

const CANDIDATES = ["Aisha Rahman", "Grace Lim", "Daniel Ong", "Marcus Tan", "Priya Nair"];
const JOBS = ["Senior Frontend Engineer", "Product Designer", "Backend Engineer", "Data Analyst"];

function InterviewsPage() {
  const [interviews, setInterviews] = useState(INITIAL_INTERVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = (interview) => {
    setInterviews((prev) =>
      [...prev, { ...interview, id: crypto.randomUUID() }].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      )
    );
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-semibold">
            <Sparkles size={12} />
            INTERVIEW SCHEDULE
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Interviews</h1>
          <p className="mt-2 text-neutral-500">
            Schedule interviews for shortlisted candidates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-12 px-5 rounded-xl bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.99] transition shrink-0"
        >
          <Plus size={16} />
          Schedule interview
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {interviews.map((i) => (
          <div
            key={i.id}
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
              <CalendarClock size={20} className="text-blue-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-900">{i.candidate}</p>
              <p className="mt-0.5 text-sm text-neutral-500">
                {i.job} · {i.type}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-sm font-medium text-neutral-900">{i.date}</p>
              <p className="text-sm text-neutral-500">{i.time}</p>
            </div>
          </div>
        ))}

        {interviews.length === 0 && (
          <div className="py-16 text-center text-sm text-neutral-400 rounded-2xl border border-neutral-200 bg-white">
            No interviews scheduled yet.
          </div>
        )}
      </div>

      {isModalOpen && (
        <InterviewModal onClose={() => setIsModalOpen(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
}

function InterviewModal({ onClose, onSubmit }) {
  const [candidate, setCandidate] = useState(CANDIDATES[0]);
  const [job, setJob] = useState(JOBS[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("Technical");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!date || !time) {
      setError("Please choose a date and time.");
      return;
    }

    setIsSaving(true);
    // TODO: POST /api/recruiter/interviews
    setTimeout(() => {
      onSubmit({ candidate, job, date, time, type });
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl border border-white/70 bg-white shadow-2xl p-6 sm:p-8">
        <button onClick={onClose} className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-700 transition">
          <X size={18} />
        </button>

        <h2 className="text-2xl font-semibold tracking-tight">Schedule interview</h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          Set up a new interview slot for a candidate.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Candidate">
            <select
              value={candidate}
              onChange={(e) => setCandidate(e.target.value)}
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
            >
              {CANDIDATES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Job">
            <select
              value={job}
              onChange={(e) => setJob(e.target.value)}
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
            >
              {JOBS.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
              />
            </Field>

            <Field label="Time">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
              />
            </Field>
          </div>

          <Field label="Interview type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-12 rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
            >
              <option>Technical</option>
              <option>Behavioral</option>
              <option>Portfolio Review</option>
              <option>Final Round</option>
            </select>
          </Field>

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
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

export default InterviewsPage;