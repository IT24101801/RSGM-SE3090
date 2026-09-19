import { getAuthHeaders } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function readResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { message: text }; }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: getAuthHeaders(),
  });
  const data = await readResponse(response);
  if (!response.ok) throw new Error(data.message || "Job-posting request failed.");
  return data;
}

export function getRecruiterJobPostings() {
  return request("/api/recruiter/postings");
}

export function createRecruiterJobPosting(job) {
  return request("/api/recruiter/postings", {
    method: "POST",
    body: JSON.stringify(job),
  });
}

export function updateRecruiterJobPosting(id, job) {
  return request(`/api/recruiter/postings/${id}`, {
    method: "PUT",
    body: JSON.stringify(job),
  });
}

export function updateRecruiterJobStatus(id, status) {
  return request(`/api/recruiter/postings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteRecruiterJobPosting(id) {
  return request(`/api/recruiter/postings/${id}`, { method: "DELETE" });
}
