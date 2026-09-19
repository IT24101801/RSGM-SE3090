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
    return Object.values(
      data.errors
    )
      .flat()
      .join(" ");
  }

  return fallback;
}

// =========================================================
// GET SKILLS
// =========================================================

export async function getMySkills() {
  const response = await fetch(
    `${API_BASE_URL}/api/jobseeker/skills`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data =
    await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to load skills."
      )
    );
  }

  return data;
}

// =========================================================
// ADD SKILL
// =========================================================

export async function addMySkill(
  skillId,
  proficiencyLevel = 3
) {
  const response = await fetch(
    `${API_BASE_URL}/api/jobseeker/skills`,
    {
      method: "POST",
      headers: getAuthHeaders(),

      body: JSON.stringify({
        skillId,
        proficiencyLevel,
      }),
    }
  );

  const data =
    await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to add skill."
      )
    );
  }

  return data;
}

// =========================================================
// UPDATE PROFICIENCY
// =========================================================

export async function updateMySkillProficiency(
  skillId,
  proficiencyLevel
) {
  const response = await fetch(
    `${API_BASE_URL}/api/jobseeker/skills/${skillId}/proficiency`,
    {
      method: "PUT",
      headers: getAuthHeaders(),

      body: JSON.stringify({
        proficiencyLevel,
      }),
    }
  );

  const data =
    await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to update skill proficiency."
      )
    );
  }

  return data;
}

// =========================================================
// DELETE SKILL
// =========================================================

export async function removeMySkill(
  skillId
) {
  const response = await fetch(
    `${API_BASE_URL}/api/jobseeker/skills/${skillId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  if (response.status === 204) {
    return true;
  }

  const data =
    await readResponse(response);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Unable to remove skill."
      )
    );
  }

  return true;
}