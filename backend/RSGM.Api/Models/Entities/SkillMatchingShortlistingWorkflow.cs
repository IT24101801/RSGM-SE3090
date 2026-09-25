namespace RSGM.Api.Models.Entities;

public enum SkillMatchingShortlistingWorkflowStatus
{
    Created,
    Planning,
    Running,
    WaitingForApproval,
    Approved,
    Rejected,
    RevisionRequested,
    Completed,
    FailedValidation,
    FailedToolExecution,
    TimedOut,
    SafelyFailed
}

public enum SkillMatchingShortlistingWorkflowStepStatus
{
    Created,
    Running,
    Completed,
    Failed
}

/// <summary>
/// Durable state for the Recruiter-owned
/// Skill Matching & Shortlisting Agent workflow.
///
/// This entity intentionally has only scalar foreign-key-style
/// identifiers for JobPosting, Recruiter and Panelist.
/// The existing ApplicationDbContext remains responsible
/// for the main RSGM business entities.
/// </summary>
public sealed class SkillMatchingShortlistingWorkflow
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid JobPostingId { get; set; }

    public Guid RecruiterId { get; set; }

    public Guid PanelistId { get; set; }

    /// <summary>
    /// Business objective supplied by the recruiter.
    /// Candidate/job text must always be treated as untrusted data.
    /// </summary>
    public string Objective { get; set; } = string.Empty;

    public SkillMatchingShortlistingWorkflowStatus Status { get; set; }
        = SkillMatchingShortlistingWorkflowStatus.Created;

    /// <summary>
    /// Structured plan returned by Groq.
    /// Only the approved four-agent plan is accepted.
    /// </summary>
    public string? PlanJson { get; set; }

    /// <summary>
    /// Structured deterministic recommendation produced
    /// before human approval.
    /// </summary>
    public string? RecommendationJson { get; set; }

    /// <summary>
    /// Recruiter who performed the approval decision.
    /// This should normally equal RecruiterId.
    /// </summary>
    public Guid? ApprovedByUserId { get; set; }

    public DateTime? ApprovedAt { get; set; }

    /// <summary>
    /// ID of the existing RSGM ShortlistDispatch record,
    /// populated only after approval and successful dispatch.
    /// </summary>
    public Guid? DispatchId { get; set; }

    /// <summary>
    /// Human review comment.
    /// </summary>
    public string? DecisionComment { get; set; }

    /// <summary>
    /// Safe, auditable failure summary.
    /// Never store hidden model reasoning here.
    /// </summary>
    public string? FailureReason { get; set; }

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; }
        = DateTime.UtcNow;

    public ICollection<SkillMatchingShortlistingWorkflowStep> Steps { get; set; }
        = new List<SkillMatchingShortlistingWorkflowStep>();
}

/// <summary>
/// One auditable execution step inside the
/// Skill Matching & Shortlisting Agent workflow.
/// </summary>
public sealed class SkillMatchingShortlistingWorkflowStep
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid WorkflowId { get; set; }

    public int StepNumber { get; set; }

    /// <summary>
    /// Exact controlled agent role name.
    /// </summary>
    public string AgentName { get; set; } = string.Empty;

    public SkillMatchingShortlistingWorkflowStepStatus Status { get; set; }
        = SkillMatchingShortlistingWorkflowStepStatus.Created;

    /// <summary>
    /// Short, auditable description of the input.
    /// Do not store sensitive secrets or hidden chain-of-thought.
    /// </summary>
    public string InputSummary { get; set; } = string.Empty;

    /// <summary>
    /// Short, auditable description of the output.
    /// Do not store hidden chain-of-thought.
    /// </summary>
    public string OutputSummary { get; set; } = string.Empty;

    public DateTime StartedAt { get; set; }
        = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }

    public string? ErrorMessage { get; set; }

    public SkillMatchingShortlistingWorkflow Workflow { get; set; }
        = null!;
}