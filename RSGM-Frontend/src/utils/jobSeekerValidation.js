export function isValidHttpUrl(value) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

export function validateProfile(profile) {
  const errors = {};

  if (!profile.fullName?.trim()) {
    errors.fullName =
      "Full name is required.";
  }

  if (
    profile.linkedInUrl &&
    !isValidHttpUrl(profile.linkedInUrl)
  ) {
    errors.linkedInUrl =
      "Enter a valid LinkedIn URL.";
  }

  if (
    profile.gitHubUrl &&
    !isValidHttpUrl(profile.gitHubUrl)
  ) {
    errors.gitHubUrl =
      "Enter a valid GitHub URL.";
  }

  if (
    profile.portfolioUrl &&
    !isValidHttpUrl(profile.portfolioUrl)
  ) {
    errors.portfolioUrl =
      "Enter a valid portfolio URL.";
  }

  return errors;
}

export function validateEducation(
  education
) {
  const errors = {};

  if (!education.institution?.trim()) {
    errors.institution =
      "Institution is required.";
  }

  if (!education.degree?.trim()) {
    errors.degree =
      "Degree is required.";
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
      "End date is required unless this education is current.";
  }

  if (
    education.startDate &&
    education.endDate &&
    new Date(education.endDate) <
      new Date(education.startDate)
  ) {
    errors.endDate =
      "End date cannot be before start date.";
  }

  return errors;
}

export function validateWorkExperience(
  experience
) {
  const errors = {};

  if (!experience.jobTitle?.trim()) {
    errors.jobTitle =
      "Job title is required.";
  }

  if (!experience.companyName?.trim()) {
    errors.companyName =
      "Company name is required.";
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
    new Date(experience.endDate) <
      new Date(experience.startDate)
  ) {
    errors.endDate =
      "End date cannot be before start date.";
  }

  return errors;
}

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

  const alreadyExists =
    existingSkills.some(
      (skill) =>
        skill.skillId === skillId
    );

  if (alreadyExists) {
    errors.skillId =
      "This skill is already on your profile.";
  }

  return errors;
}

export function validateCv(file) {
  if (!file) {
    return "Please select a CV.";
  }

  if (
    file.type !== "application/pdf"
  ) {
    return "CV must be a PDF file.";
  }

  const maxSize =
    5 * 1024 * 1024;

  if (file.size > maxSize) {
    return "CV must be smaller than 5 MB.";
  }

  return "";
}

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
  } else {
    if (newPassword.length < 8) {
      errors.newPassword =
        "Password must contain at least 8 characters.";
    } else if (
      !/[A-Z]/.test(newPassword)
    ) {
      errors.newPassword =
        "Password must contain an uppercase letter.";
    } else if (
      !/[a-z]/.test(newPassword)
    ) {
      errors.newPassword =
        "Password must contain a lowercase letter.";
    } else if (
      !/[0-9]/.test(newPassword)
    ) {
      errors.newPassword =
        "Password must contain a number.";
    }
  }

  if (
    newPassword !==
    confirmPassword
  ) {
    errors.confirmPassword =
      "Passwords do not match.";
  }

  return errors;
}

export function hasErrors(errors) {
  return (
    Object.keys(errors).length > 0
  );
}