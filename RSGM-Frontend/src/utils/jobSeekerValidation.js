const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;

export function firstValidationMessage(errors) {
  return Object.values(errors)[0] || "Please check the form.";
}

function isBlank(value) {
  return !value || !String(value).trim();
}

function isValidHttpUrl(value) {
  if (isBlank(value)) {
    return true;
  }

  try {
    const url = new URL(String(value).trim());

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

// =========================================================
// PROFILE VALIDATION
// =========================================================

export function validateProfile(profile) {
  const errors = {};

  if (isBlank(profile.fullName)) {
    errors.fullName =
      "Full name is required.";
  } else if (
    profile.fullName.trim().length > 100
  ) {
    errors.fullName =
      "Full name cannot be longer than 100 characters.";
  }

  if (
    (profile.headline || "").length > 150
  ) {
    errors.headline =
      "Headline cannot be longer than 150 characters.";
  }

  if (
    (profile.location || "").length > 150
  ) {
    errors.location =
      "Location cannot be longer than 150 characters.";
  }

  if (
    (profile.bio || "").length > 1000
  ) {
    errors.bio =
      "About you cannot be longer than 1000 characters.";
  }

  const urlFields = [
    ["linkedInUrl", "LinkedIn"],
    ["gitHubUrl", "GitHub"],
    ["portfolioUrl", "Portfolio"],
  ];

  for (const [key, label] of urlFields) {
    const value = profile[key] || "";

    if (value.length > 500) {
      errors[key] =
        `${label} URL cannot be longer than 500 characters.`;
    } else if (!isValidHttpUrl(value)) {
      errors[key] =
        `${label} URL must start with http:// or https://.`;
    }
  }

  return errors;
}

// =========================================================
// EDUCATION VALIDATION
// =========================================================

export function validateEducation(
  education
) {
  const errors = {};

  if (!education) {
    return {
      form:
        "Education details are required.",
    };
  }

  if (
    isBlank(education.institution)
  ) {
    errors.institution =
      "Institution is required.";
  } else if (
    education.institution.trim().length >
    150
  ) {
    errors.institution =
      "Institution cannot be longer than 150 characters.";
  }

  if (isBlank(education.degree)) {
    errors.degree =
      "Degree is required.";
  } else if (
    education.degree.trim().length > 150
  ) {
    errors.degree =
      "Degree cannot be longer than 150 characters.";
  }

  if (
    (education.fieldOfStudy || "")
      .length > 150
  ) {
    errors.fieldOfStudy =
      "Field of study cannot be longer than 150 characters.";
  }

  if (
    (education.description || "")
      .length > 1000
  ) {
    errors.description =
      "Description cannot be longer than 1000 characters.";
  }

  if (!education.startDate) {
    errors.startDate =
      "Start date is required.";
  }

  if (
    !education.isCurrent &&
    !education.endDate
  ) {
    errors.endDate =
      "End date is required unless you are currently studying here.";
  }

  if (
    education.startDate &&
    education.endDate &&
    education.endDate <
      education.startDate
  ) {
    errors.endDate =
      "End date cannot be before start date.";
  }

  return errors;
}

// =========================================================
// WORK EXPERIENCE VALIDATION
// =========================================================

export function validateWorkExperience(
  experience
) {
  const errors = {};

  if (!experience) {
    return {
      form:
        "Work experience details are required.",
    };
  }

  if (
    isBlank(experience.jobTitle)
  ) {
    errors.jobTitle =
      "Job title is required.";
  } else if (
    experience.jobTitle.trim().length >
    150
  ) {
    errors.jobTitle =
      "Job title cannot be longer than 150 characters.";
  }

  if (
    isBlank(experience.companyName)
  ) {
    errors.companyName =
      "Company name is required.";
  } else if (
    experience.companyName.trim().length >
    150
  ) {
    errors.companyName =
      "Company name cannot be longer than 150 characters.";
  }

  if (
    (experience.location || "")
      .length > 150
  ) {
    errors.location =
      "Location cannot be longer than 150 characters.";
  }

  if (
    (experience.description || "")
      .length > 1000
  ) {
    errors.description =
      "Description cannot be longer than 1000 characters.";
  }

  if (!experience.startDate) {
    errors.startDate =
      "Start date is required.";
  }

  if (
    !experience.isCurrent &&
    !experience.endDate
  ) {
    errors.endDate =
      "End date is required unless this is your current job.";
  }

  if (
    experience.startDate &&
    experience.endDate &&
    experience.endDate <
      experience.startDate
  ) {
    errors.endDate =
      "End date cannot be before start date.";
  }

  return errors;
}

// =========================================================
// SKILL VALIDATION
// =========================================================

export function validateSkill(
  skillId,
  proficiencyLevel,
  existingSkills = []
) {
  const errors = {};

  if (!skillId) {
    errors.skillId =
      "Please select a skill.";
  }

  const level =
    Number(proficiencyLevel);

  if (
    !Number.isInteger(level) ||
    level < 1 ||
    level > 5
  ) {
    errors.proficiencyLevel =
      "Proficiency must be between 1 and 5.";
  }

  if (
    skillId &&
    existingSkills.some(
      (skill) =>
        String(skill.skillId) ===
        String(skillId)
    )
  ) {
    errors.skillId =
      "This skill is already on your profile.";
  }

  return errors;
}

// =========================================================
// CV VALIDATION
// =========================================================

export function validateCv(file) {
  if (!file) {
    return "Please select a CV file.";
  }

  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
  ];

  const fileName =
    file.name.toLowerCase();

  const hasAllowedExtension =
    allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const hasAllowedMimeType =
    !file.type ||
    allowedMimeTypes.includes(
      file.type
    );

  if (
    !hasAllowedExtension ||
    !hasAllowedMimeType
  ) {
    return "CV must be a PDF, DOC, or DOCX file.";
  }

  if (
    file.size > MAX_CV_SIZE_BYTES
  ) {
    return "CV must be 5 MB or smaller.";
  }

  return "";
}

// =========================================================
// PASSWORD VALIDATION
// =========================================================

export function validatePasswordChange(
  currentPassword,
  newPassword,
  confirmPassword
) {
  const errors = {};

  if (!currentPassword) {
    errors.currentPassword =
      "Current password is required.";
  }

  if (!newPassword) {
    errors.newPassword =
      "New password is required.";
  } else if (
    newPassword.length < 8
  ) {
    errors.newPassword =
      "New password must contain at least 8 characters.";
  } else if (
    !/[A-Z]/.test(newPassword)
  ) {
    errors.newPassword =
      "New password must contain at least one uppercase letter.";
  } else if (
    !/[a-z]/.test(newPassword)
  ) {
    errors.newPassword =
      "New password must contain at least one lowercase letter.";
  } else if (
    !/[0-9]/.test(newPassword)
  ) {
    errors.newPassword =
      "New password must contain at least one number.";
  } else if (
    newPassword === currentPassword
  ) {
    errors.newPassword =
      "New password must be different from your current password.";
  }

  if (!confirmPassword) {
    errors.confirmPassword =
      "Please confirm your new password.";
  } else if (
    newPassword !== confirmPassword
  ) {
    errors.confirmPassword =
      "New password and confirmation do not match.";
  }

  return errors;
}