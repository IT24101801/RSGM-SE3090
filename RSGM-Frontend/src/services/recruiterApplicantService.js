import { getAuthHeaders } from "./authService";

const base = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const response = await fetch(
    `${base}/api/recruiter/applications${path}`,
    {
      ...options,
      headers: getAuthHeaders(),
    }
  );

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(
      data?.message || "Request failed."
    );
  }

  return data;
}

export const getRecruiterApplicants = (jobId) =>
  request(
    jobId
      ? `?jobId=${encodeURIComponent(jobId)}`
      : ""
  );

export const reviewRecruiterApplicant = (
  id,
  status
) =>
  request(`/${id}/decision`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const rankRecruiterShortlist = (
  jobId,
  orderedApplicationIds
) =>
  request(`/jobs/${jobId}/shortlist/rank`, {
    method: "PUT",
    body: JSON.stringify({
      orderedApplicationIds,
    }),
  });

export async function downloadRecruiterApplicantCv(
  id,
  fileName = "candidate-cv"
) {
  const response = await fetch(
    `${base}/api/recruiter/applications/${id}/cv`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("CV is unavailable.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName || "candidate-cv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 60000);
}