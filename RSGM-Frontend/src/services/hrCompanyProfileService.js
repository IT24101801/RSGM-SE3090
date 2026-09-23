import { getAuthHeaders } from "./authService";

const base = import.meta.env.VITE_API_BASE_URL;

async function call(method = "GET", body) {
  const response = await fetch(`${base}/api/hr/company-profile`, {
    method, headers: getAuthHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!response.ok) throw new Error(data?.message || "Unable to load the company profile.");
  return data;
}

export const getHrCompanyProfile = () => call();
export const saveHrCompanyProfile = (details) => call("PUT", details);
