import { useState } from "react";
import {
  CalendarClock, CheckCircle2, Eye, MessageSquareText, Sparkles,
} from "lucide-react";

import CandidateDetailPanel from "../../components/panelist/CandidateDetailPanel";
import FeedbackModal from "../../components/panelist/FeedbackModal";

// TODO: replace with GET /api/panelist/interviews
const INITIAL_INTERVIEWS = [
  {
    id: "i1",
    job: "Senior Frontend Engineer",
    date: "2026-09-14",
    time: "10:00 AM",
    type: "Technical",
    feedbackSubmitted: false,
    candidate: {
      name: "Aisha Rahman",
      location: "Singapore",
      matchScore: 92,
      summary: "Frontend engineer with 4 years of experience building React applications for fintech and e-commerce products.",
      skills: ["React", "TypeScript", "Tailwind CSS", "Testing"],
      experience: [
        { title: "Frontend Engineer", company: "PayFlow", duration: "2023 - Present" },
        { title: "Junior Developer", company: "ShopWave", duration: "2021 - 2023" },
      ],
      cvFileName: "Aisha_Rahman_CV.pdf",
    },
  },
  {
    id: "i2",
    job: "Product Designer",
    date: "2026-09-15",
    time: "2:30 PM",
    type: "Portfolio Review",
    feedbackSubmitted: false,
    candidate: {
      name: "Marcus Tan",
      location: "Singapore",
      matchScore: 88,
      summary: "Product designer focused on design systems and cross-platform consistency.",
      skills: ["Figma", "Design Systems", "Prototyping"],
      experience: [
        { title: "Product Designer", company: "Northwind", duration: "2022 - Present" },
      ],
      cvFileName: "Marcus_Tan_Portfolio.pdf",
    },
  },
  {
    id: "i3",
    job: "Backend Engineer",
    date: "2026-09-08",
    time: "11:00 AM",
    type: "Technical",
    feedbackSubmitted: true,
    candidate: {
      name: "Priya Nair",
      location: "Remote",
      matchScore: 79,
      summary: "Backend engineer with strong experience in distributed systems and API design.",
      skills: ["Node.js", "PostgreSQL", "Docker"],
      experience: [
        { title: "Backend Engineer", company: "DataForge", duration: "2020 - Present" },
      ],
      cvFileName: "Priya_Nair_CV.pdf",
    },
  },
];

function MyInterviewsPage() {
  const [interviews, setInterviews] = useState(INITIAL_INTERVIEWS);
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [givingFeedbackFor, setGivingFeedbackFor] = useState(null);

  const openCandidate = (interview) => setViewingCandidate(interview);

  const openFeedbackFrom = (interview) => {
    setViewingCandidate(null);
    setGivingFeedbackFor(interview);
  };

  const handleFeedbackSubmit = (feedback) => {
    // TODO: also send `feedback` payload to backend
    setInterviews((prev) =>
      prev.map((i) => (i.id === givingFeedbackFor.id ? { ...i, feedbackSubmitted: true } : i))
    );
    setGivingFeedbackFor(null);
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-semibold">
        <Sparkles size={12} />
        ASSIGNED INTERVIEWS
      </div>

      <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">My Interviews</h1>
      <p className="mt-2 text-neutral-500">
        Review candidates before each session and submit structured feedback afterward.
      </p>

      <div className="mt-8 space-y-3">
        {interviews.map((i) => (
          <div
            key={i.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/70 bg-white/75 backdrop-blur-2xl shadow-xl shadow-neutral-200/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <CalendarClock size={20} className="text-amber-600" />
              </div>

              <div>
                <p className="font-medium text-neutral-900">{i.candidate.name}</p>
                <p className="mt-0.5 text-sm text-neutral-500">
                  {i.job} · {i.type}
                </p>
                <p className="mt-0.5 text-xs text-neutral-400">{i.date} · {i.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {i.feedbackSubmitted && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 size={12} />
                  Feedback submitted
                </span>
              )}

              <button
                onClick={() => openCandidate(i)}
                className="h-10 px-4 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition flex items-center gap-1.5"
              >
                <Eye size={14} />
                View candidate
              </button>

              <button
                onClick={() => setGivingFeedbackFor(i)}
                className="h-10 px-4 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 active:scale-[0.99] transition flex items-center gap-1.5"
              >
                <MessageSquareText size={14} />
                {i.feedbackSubmitted ? "Edit feedback" : "Give feedback"}
              </button>
            </div>
          </div>
        ))}

        {interviews.length === 0 && (
          <div className="py-16 text-center text-sm text-neutral-400 rounded-2xl border border-neutral-200 bg-white">
            No interviews assigned yet.
          </div>
        )}
      </div>

      {viewingCandidate && (
        <CandidateDetailPanel
          interview={viewingCandidate}
          onClose={() => setViewingCandidate(null)}
          onGiveFeedback={() => openFeedbackFrom(viewingCandidate)}
        />
      )}

      {givingFeedbackFor && (
        <FeedbackModal
          interview={givingFeedbackFor}
          onClose={() => setGivingFeedbackFor(null)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
}

export default MyInterviewsPage;