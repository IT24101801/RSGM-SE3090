import { getAuthHeaders } from "./authService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

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

function getErrorMessage(
  data,
  fallback
) {
  if (!data) {
    return fallback;
  }

  if (data.message) {
    return data.message;
  }

  if (
    data.errors &&
    typeof data.errors === "object"
  ) {
    return Object.values(data.errors)
      .flat()
      .join(" ");
  }

  return fallback;
}

export async function getHrRequisitions() {
  const response = await fetch(
    `${API_BASE_URL}/api/hr/requisitions`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data =
    await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to load requisitions."
      )
    );
  }

  return data;
}

export async function approveRequisition(
  id
) {
  const response = await fetch(
    `${API_BASE_URL}/api/hr/requisitions/${id}/approve`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );

  const data =
    await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to approve requisition."
      )
    );
  }

  return data;
}

export async function rejectRequisition(
  id,
  feedback
) {
  const response = await fetch(
    `${API_BASE_URL}/api/hr/requisitions/${id}/reject`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        feedback,
      }),
    }
  );

  const data =
    await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to reject requisition."
      )
    );
  }

  return data;
}