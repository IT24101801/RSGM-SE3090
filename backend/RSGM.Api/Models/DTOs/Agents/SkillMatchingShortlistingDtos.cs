using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.Agents;

/// <summary>
/// Starts a new Skill Matching & Shortlisting Agent workflow.
/// </summary>
public sealed class StartSkillMatchingShortlistingRequest
{
    public Guid JobPostingId { get; set; }

    public Guid PanelistId { get; set; }

    [MaxLength(1000)]
    public string? Objective { get; set; }
}

/// <summary>
/// Human approval/rejection information.
/// </summary>
public sealed class SkillMatchingApprovalRequest
{
    [MaxLength(1000)]
    public string? Comment { get; set; }
}

/// <summary>
/// Structured four-agent plan returned by Groq.
/// </summary>
public sealed class SkillMatchingAgentPlanDto
{
    public string Objective { get; set; } = string.Empty;

    public List<SkillMatchingAgentPlanStepDto> Steps { get; set; }
        = new();
}

public sealed class SkillMatchingAgentPlanStepDto
{
    public int Sequence { get; set; }

    public string Agent { get; set; } = string.Empty;

    public string Action { get; set; } = string.Empty;
}

/// <summary>
/// One candidate's deterministic matching result.
/// </summary>
public sealed class SkillMatchingCandidateDto
{
    public Guid ApplicationId { get; set; }

    public Guid CandidateId { get; set; }

    public string CandidateName { get; set; } = string.Empty;

    public int Score { get; set; }

    public decimal ExactScore { get; set; }

    public List<string> MatchedSkills { get; set; }
        = new();

    public List<string> MissingSkills { get; set; }
        = new();

    public string Explanation { get; set; } = string.Empty;

    public List<SkillMatchingBreakdownDto> Breakdown { get; set; }
        = new();
}

public sealed class SkillMatchingBreakdownDto
{
    public Guid SkillId { get; set; }

    public string SkillName { get; set; } = string.Empty;

    public decimal RequiredWeight { get; set; }

    public int? CandidateProficiency { get; set; }

    public string? ProficiencyLabel { get; set; }

    public decimal ContributionPercentage { get; set; }

    public bool Matched { get; set; }
}

/// <summary>
/// Deterministic recommendation produced before human approval.
/// </summary>
public sealed class SkillMatchingAgentRecommendationDto
{
    public List<Guid> RecommendedApplicationIds { get; set; }
        = new();

    public List<SkillMatchingCandidateDto> RankedCandidates { get; set; }
        = new();

    public string Summary { get; set; } = string.Empty;
}

/// <summary>
/// API representation of the durable workflow.
/// </summary>
public sealed class SkillMatchingWorkflowDto
{
    public Guid Id { get; set; }

    public Guid JobPostingId { get; set; }

    public Guid RecruiterId { get; set; }

    public Guid PanelistId { get; set; }

    public string Objective { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public SkillMatchingAgentPlanDto? Plan { get; set; }

    public SkillMatchingAgentRecommendationDto? Recommendation { get; set; }

    public Guid? ApprovedByUserId { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public Guid? DispatchId { get; set; }

    public string? DecisionComment { get; set; }

    public string? FailureReason { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public List<SkillMatchingWorkflowStepDto> Steps { get; set; }
        = new();
}

public sealed class SkillMatchingWorkflowStepDto
{
    public int StepNumber { get; set; }

    public string AgentName { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string InputSummary { get; set; } = string.Empty;

    public string OutputSummary { get; set; } = string.Empty;

    public DateTime StartedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public string? ErrorMessage { get; set; }
}

// =============================================================
// Controlled Agent Tool Contracts
// =============================================================

public sealed record SkillMatchingJobRequirements(
    Guid JobPostingId,
    string JobTitle,
    int Headcount,
    string Objective,
    IReadOnlyList<SkillMatchingRequiredSkill> RequiredSkills);

public sealed record SkillMatchingRequiredSkill(
    Guid SkillId,
    string SkillName,
    decimal Weight);

public sealed record SkillMatchingCandidateInput(
    Guid ApplicationId,
    Guid CandidateId,
    string CandidateName);

public sealed record SkillMatchingToolResult(
    Guid ApplicationId,
    Guid CandidateId,
    string CandidateName,
    int Score,
    decimal ExactScore,
    List<string> MatchedSkills,
    List<string> MissingSkills,
    string Explanation,
    List<SkillMatchingBreakdownDto> Breakdown);

public sealed record SkillMatchingGapResult(
    List<string> Gaps,
    string Summary);

public sealed record SkillMatchingValidationResult(
    bool IsValid,
    List<string> Errors);