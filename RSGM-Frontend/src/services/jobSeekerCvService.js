import { getToken } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function readResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors.join(" ");
  if (data.errors && typeof data.errors === "object") {
    return Object.values(data.errors).flat().join(" ");
  }
  return fallback;
}

// GET /api/jobseeker/cv
// Returns null (not an error) when no CV has been uploaded yet.
export async function getCv() {
  const response = await fetch(`${API_BASE_URL}/api/jobseeker/cv`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Unable to load CV."));
  }

  return data;
}

// POST /api/jobseeker/cv (multipart/form-data)
// IMPORTANT: don't set a Content-Type header here — the browser sets its
// own multipart boundary automatically. Setting it manually breaks upload.
export async function uploadCv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/jobseeker/cv`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Unable to upload CV."));
  }

  return data;
}

// DELETE /api/jobseeker/cv
export async function deleteCv() {
  const response = await fetch(`${API_BASE_URL}/api/jobseeker/cv`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (response.status === 204) {
    return true;
  }

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Unable to delete CV."));
  }

  return true;
}