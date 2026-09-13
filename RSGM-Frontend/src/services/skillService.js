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

// GET /api/skills — any authenticated user
export async function getSkills() {
  const response = await fetch(`${API_BASE_URL}/api/skills`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await readResponse(response);
  if (!response.ok) throw new Error(getErrorMessage(data, "Unable to load skills."));
  return data;
}

// GET /api/skills/{id}
export async function getSkillById(id) {
  const response = await fetch(`${API_BASE_URL}/api/skills/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await readResponse(response);
  if (!response.ok) throw new Error(getErrorMessage(data, "Skill not found."));
  return data;
}

// POST /api/admin/skills — SystemAdmin only
export async function createSkill(skillData) {
  const response = await fetch(`${API_BASE_URL}/api/admin/skills`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(skillData),
  });
  const data = await readResponse(response);
  if (!response.ok) throw new Error(getErrorMessage(data, "Unable to create skill."));
  return data;
}

// PUT /api/admin/skills/{id} — SystemAdmin only
export async function updateSkill(id, skillData) {
  const response = await fetch(`${API_BASE_URL}/api/admin/skills/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(skillData),
  });
  if (response.status === 204) return true;
  const data = await readResponse(response);
  if (!response.ok) throw new Error(getErrorMessage(data, "Unable to update skill."));
  return true;
}

// DELETE /api/admin/skills/{id} — SystemAdmin only (soft delete)
export async function deactivateSkill(id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/skills/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (response.status === 204) return true;
  const data = await readResponse(response);
  if (!response.ok) throw new Error(getErrorMessage(data, "Unable to deactivate skill."));
  return true;
}