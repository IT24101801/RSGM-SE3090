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

  if (typeof data === "string") {
    return data;
  }

  if (data.message) {
    return data.message;
  }

  if (
    Array.isArray(data.errors) &&
    data.errors.length > 0
  ) {
    return data.errors.join(" ");
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

export async function getMyRequisitions() {
  const response = await fetch(
    `${API_BASE_URL}/api/recruiter/requisitions`,
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

export async function getMyRequisition(
  id
) {
  const response = await fetch(
    `${API_BASE_URL}/api/recruiter/requisitions/${id}`,
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
        "Unable to load requisition."
      )
    );
  }

  return data;
}

export async function createRequisition(
  request
) {
  const response = await fetch(
    `${API_BASE_URL}/api/recruiter/requisitions`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    }
  );

  const data =
    await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to create requisition."
      )
    );
  }

  return data;
}

export async function updateRequisition(
  id,
  request
) {
  const response = await fetch(
    `${API_BASE_URL}/api/recruiter/requisitions/${id}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    }
  );

  const data =
    await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to update requisition."
      )
    );
  }

  return data;
}

export async function submitRequisition(
  id
) {
  const response = await fetch(
    `${API_BASE_URL}/api/recruiter/requisitions/${id}/submit`,
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
        "Unable to submit requisition."
      )
    );
  }

  return data;
}