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
  if (!response.ok) throw new Error(data.message || "Company request failed.");
  return data;
}

export function getAdminCompanies() {
  return request("/api/admin/companies");
}

export function createCompany(company) {
  return request("/api/admin/companies", {
    method: "POST",
    body: JSON.stringify(company),
  });
}

export function updateCompany(id, company) {
  return request(`/api/admin/companies/${id}`, {
    method: "PUT",
    body: JSON.stringify(company),
  });
}

export function updateCompanyStatus(id, isActive) {
  return request(`/api/admin/companies/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export function deleteCompany(id) {
  return request(`/api/admin/companies/${id}`, { method: "DELETE" });
}

export function assignCompanyMember(companyId, userId) {
  return request(`/api/admin/companies/${companyId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function removeCompanyMember(companyId, userId) {
  return request(`/api/admin/companies/${companyId}/members/${userId}`, {
    method: "DELETE",
  });
}
