from career_schemas import (
    CandidateProfileInput,
    CareerAdvice,
    JobInput,
    JobMatch,
    ProfileAnalysis,
    ValidationResult,
)


def validate_career_result(candidate: CandidateProfileInput, jobs: list[JobInput],
                           profile: ProfileAnalysis, matches: list[JobMatch],
                           advice: CareerAdvice | None) -> ValidationResult:
    """Deterministic validator that rejects unsupported or inconsistent agent output."""
    errors: list[str] = []
    checks: list[str] = []

    candidate_skill_names = {skill.name.casefold() for skill in candidate.skills}
    output_skill_names = {name.casefold() for name in profile.strong_skills + profile.developing_skills}
    unsupported = sorted(output_skill_names - candidate_skill_names)
    if unsupported:
        errors.append("Profile analysis referenced unrecorded skills: " + ", ".join(unsupported))
    else:
        checks.append("Profile skill claims are supported by the candidate snapshot.")

    jobs_by_id = {job.id: job for job in jobs}
    for match in matches:
        job = jobs_by_id.get(match.job_id)
        if job is None:
            errors.append(f"Match references unknown job {match.job_id}.")
            continue
        required_names = {skill.name.casefold() for skill in job.required_skills}
        if any(name.casefold() not in required_names for name in match.matched_skills + match.missing_skills):
            errors.append(f"Match for job {match.job_id} references a skill not required by the job.")

    if not errors:
        checks.append("Every recommendation references a supplied published job.")
        checks.append("Matched and missing skill lists are constrained to job requirements.")

    if matches and advice is not None and advice.selected_job_id != matches[0].job_id:
        errors.append("Career advice does not reference the highest-ranked job.")
    elif matches and advice is not None:
        checks.append("Career advice references the highest-ranked deterministic match.")

    return ValidationResult(valid=not errors, errors=errors, checks=checks)
