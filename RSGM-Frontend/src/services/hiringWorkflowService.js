import { getAuthHeaders } from "./authService";

const base = import.meta.env.VITE_API_BASE_URL;

async function call(path, method = "GET", body) {
  const response = await fetch(`${base}/api${path}`, {
    method,
    headers: getAuthHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!response.ok) throw new Error(data?.message || (response.status === 401 ? "Sign in again." : "Request failed."));
  return data;
}

export const getPanelists = () => call("/recruiter/panelists");
export const getInterviewOfficeHours = () => call("/recruiter/interviews/office-hours");
export const getRecruiterInterviews = () => call("/recruiter/interviews");
export const scheduleInterview = (details) => call("/recruiter/interviews", "POST", details);
export const rescheduleInterview = (id, scheduledAt) => call(`/recruiter/interviews/${id}/reschedule`, "PUT", { scheduledAt });
export const cancelInterview = (id) => call(`/recruiter/interviews/${id}/cancel`, "POST");
export const getPanelistInterviews = () => call("/panelist/interviews");
export const getPanelistCandidate = (id) => call(`/panelist/interviews/${id}/candidate`);

export async function downloadPanelistCandidateCv(id, fallbackName = "candidate-cv") {
  const response = await fetch(`${base}/api/panelist/interviews/${id}/cv`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const details = await response.json().catch(() => null);
    throw new Error(details?.message || "CV is unavailable.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fallbackName || "candidate-cv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export const saveInterviewFeedback = (id, feedback) => call(`/panelist/interviews/${id}/feedback`, "PUT", feedback);
export const getRecruiterOffers = () => call("/recruiter/offers");
export const saveOffer = (details) => call("/recruiter/offers", "PUT", details);
export const submitOffer = (id) => call(`/recruiter/offers/${id}/submit`, "POST");
export const withdrawOffer = (id) => call(`/recruiter/offers/${id}/withdraw`, "POST");
export const getHrOffers = () => call("/hr/offers");
export const approveOffer = (id) => call(`/hr/offers/${id}/approve`, "POST");
export const rejectOffer = (id, reason) => call(`/hr/offers/${id}/reject`, "POST", { reason });
export const getJobSeekerOffers = () => call("/jobseeker/offers");
export const acceptOffer = (id) => call(`/jobseeker/offers/${id}/accept`, "POST");
export const declineOffer = (id, reason) => call(`/jobseeker/offers/${id}/decline`, "POST", { reason });

// HR Analytics
export const getHrDashboardSummary = () => call("/hr/dashboard-summary");
export const getHrAnalytics = () => call("/hr/analytics");
export const getHrWorkflows = () => call("/hr/workflows");
