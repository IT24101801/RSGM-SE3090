import { getAuthHeaders } from "./authService";

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

// GET /api/jobseeker/profile
export async function getProfile() {
  const response = await fetch(`${API_BASE_URL}/api/jobseeker/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Unable to load profile."));
  }

  return data;
}

// PUT /api/jobseeker/profile
export async function updateProfile(profileData) {
  const response = await fetch(`${API_BASE_URL}/api/jobseeker/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Unable to save profile."));
  }

  return data;
}

// PUT /api/jobseeker/profile/password
export async function changePassword(currentPassword, newPassword) {
  const response = await fetch(`${API_BASE_URL}/api/jobseeker/profile/password`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Unable to update password."));
  }

  return data;
}

// DELETE /api/jobseeker/account
export async function deleteAccount(currentPassword) {
  const response = await fetch(`${API_BASE_URL}/api/jobseeker/account`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword }),
  });

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Unable to delete account."));
  }

  return data;
}

async function profileCollectionRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: getAuthHeaders(),
  });

  const data = await readResponse(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Profile request failed."));
  }
  return data;
}

export function getEducationRecords() {
  return profileCollectionRequest("/api/jobseeker/education");
}

export function createEducationRecord(record) {
  return profileCollectionRequest("/api/jobseeker/education", {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export function updateEducationRecord(id, record) {
  return profileCollectionRequest(`/api/jobseeker/education/${id}`, {
    method: "PUT",
    body: JSON.stringify(record),
  });
}

export function deleteEducationRecord(id) {
  return profileCollectionRequest(`/api/jobseeker/education/${id}`, {
    method: "DELETE",
  });
}

export function getWorkExperiences() {
  return profileCollectionRequest("/api/jobseeker/work-experience");
}

export function createWorkExperience(experience) {
  return profileCollectionRequest("/api/jobseeker/work-experience", {
    method: "POST",
    body: JSON.stringify(experience),
  });
}

export function updateWorkExperience(id, experience) {
  return profileCollectionRequest(`/api/jobseeker/work-experience/${id}`, {
    method: "PUT",
    body: JSON.stringify(experience),
  });
}

export function deleteWorkExperience(id) {
  return profileCollectionRequest(`/api/jobseeker/work-experience/${id}`, {
    method: "DELETE",
  });
}
