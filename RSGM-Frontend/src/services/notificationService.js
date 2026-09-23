import { getAuthHeaders } from "./authService";

const base = import.meta.env.VITE_API_BASE_URL;

async function request(path, method = "GET") {
  const response = await fetch(`${base}/api/notifications${path}`, {
    method,
    headers: getAuthHeaders(),
  });
  const body = await response.text();
  let data;
  try { data = body ? JSON.parse(body) : null; } catch { data = null; }
  if (!response.ok) throw new Error(data?.message || "Unable to load notifications.");
  return data;
}

export const getNotifications = () => request("");
export const getUnreadNotificationCount = () => request("/unread-count");
export const markNotificationRead = (id) => request(`/${id}/read`, "PATCH");
export const markAllNotificationsRead = () => request("/read-all", "POST");
