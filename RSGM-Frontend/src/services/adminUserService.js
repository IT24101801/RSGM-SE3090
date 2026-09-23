import { getAuthHeaders } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function readResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { message: text }; }
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

export async function getAdminUsers() {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: "GET", headers: getAuthHeaders(),
  });
  const data = await readResponse(response);
  if (!response.ok) throw new Error(getErrorMessage(data, "Unable to load users."));
  return data;
}

export async function updateAdminUserStatus(id, isActive) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/status`, {
    method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify({ isActive }),
  });
  const data = await readResponse(response);
  if (!response.ok) throw new Error(getErrorMessage(data, "Unable to update user status."));
  return data;
}

export async function updateAdminUserRole(id, role, companyId = null) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}/role`, {
    method: "PATCH", headers: getAuthHeaders(), body: JSON.stringify({ role, companyId }),
  });
  const data = await readResponse(response);
  if (!response.ok) throw new Error(getErrorMessage(data, "Unable to update user role."));
  return data;
}
