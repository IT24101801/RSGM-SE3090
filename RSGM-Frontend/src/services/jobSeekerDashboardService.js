import { getAuthHeaders } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function readResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

function getErrorMessage(data, fallback) {
  if (!data) {
    return fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.message) {
    return data.message;
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.join(" ");
  }

  if (data.errors && typeof data.errors === "object") {
    return Object.values(data.errors)
      .flat()
      .join(" ");
  }

  return fallback;
}

async function request(path, options = {}) {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers: getAuthHeaders(),
    }
  );

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Dashboard request failed."
      )
    );
  }

  return data;
}

// =========================================================
// JOB SEEKER DASHBOARD
// =========================================================

// GET /api/jobseeker/dashboard
export function getJobSeekerDashboard() {
  return request(
    "/api/jobseeker/dashboard"
  );
}