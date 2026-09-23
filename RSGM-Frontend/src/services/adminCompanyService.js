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
        "Company request failed."
      )
    );
  }

  return data;
}

// =========================================================
// GET ALL COMPANIES
// =========================================================

// GET /api/admin/companies
export function getAdminCompanies() {
  return request(
    "/api/admin/companies"
  );
}

// =========================================================
// GET COMPANY BY ID
// =========================================================

// GET /api/admin/companies/{id}
export function getAdminCompany(id) {
  return request(
    `/api/admin/companies/${id}`
  );
}

// =========================================================
// CREATE COMPANY
// =========================================================

// POST /api/admin/companies
export function createAdminCompany(company) {
  return request(
    "/api/admin/companies",
    {
      method: "POST",
      body: JSON.stringify(company),
    }
  );
}

// =========================================================
// UPDATE COMPANY
// =========================================================

// PUT /api/admin/companies/{id}
export function updateAdminCompany(
  id,
  company
) {
  return request(
    `/api/admin/companies/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(company),
    }
  );
}

// =========================================================
// UPDATE COMPANY STATUS
// =========================================================

// PATCH /api/admin/companies/{id}/status
export function updateAdminCompanyStatus(
  id,
  isActive
) {
  return request(
    `/api/admin/companies/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        isActive,
      }),
    }
  );
}

// =========================================================
// ASSIGN USER TO COMPANY
// =========================================================

// POST /api/admin/companies/{companyId}/members
export function assignCompanyMember(
  companyId,
  userId
) {
  return request(
    `/api/admin/companies/${companyId}/members`,
    {
      method: "POST",
      body: JSON.stringify({
        userId,
      }),
    }
  );
}

// =========================================================
// REMOVE USER FROM COMPANY
// =========================================================

// DELETE /api/admin/companies/{companyId}/members/{userId}
export function removeCompanyMember(
  companyId,
  userId
) {
  return request(
    `/api/admin/companies/${companyId}/members/${userId}`,
    {
      method: "DELETE",
    }
  );
}