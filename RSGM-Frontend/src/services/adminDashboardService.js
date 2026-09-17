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

export async function getAdminDashboardStats() {
  const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await readResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Unable to load dashboard statistics.");
  }

  return data;
}
