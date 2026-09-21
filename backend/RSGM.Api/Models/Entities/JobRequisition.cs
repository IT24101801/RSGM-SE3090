namespace RSGM.Api.Models.Entities;

public enum JobRequisitionStatus
{
    Draft,
    Submitted,
    Rejected,
    Approved
}

public class JobRequisition
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // ---------------------------------------------------------
    // COMPANY
    // ---------------------------------------------------------

    // The company this requisition belongs to.
    public Guid CompanyId { get; set; }

    public Company Company { get; set; } = null!;

    // ---------------------------------------------------------
    // RECRUITER
    // ---------------------------------------------------------

    // Recruiter who created the requisition.
    public Guid RecruiterId { get; set; }

    public ApplicationUser Recruiter { get; set; } = null!;

    // ---------------------------------------------------------
    // JOB INFORMATION
    // ---------------------------------------------------------

    public string PositionTitle { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public int Headcount { get; set; }

    public EmploymentType EmploymentType { get; set; }

    public WorkMode WorkMode { get; set; }

    public string Location { get; set; } = string.Empty;

    public ExperienceLevel ExperienceLevel { get; set; }

    public int? MinExperienceYears { get; set; }

    // ---------------------------------------------------------
    // SALARY
    // ---------------------------------------------------------

    public decimal? MinSalary { get; set; }

    public decimal? MaxSalary { get; set; }

    public string? Currency { get; set; }

    // ---------------------------------------------------------
    // DESCRIPTION
    // ---------------------------------------------------------

    public string? Description { get; set; }

    public string? Responsibilities { get; set; }

    public string? Requirements { get; set; }

    // Why the company needs this position.
    public string? Justification { get; set; }

    // ---------------------------------------------------------
    // APPROVAL WORKFLOW
    // ---------------------------------------------------------

    public JobRequisitionStatus Status { get; set; }
        = JobRequisitionStatus.Draft;

    // HR must provide feedback when rejecting.
    public string? HrFeedback { get; set; }

    // HR Manager who reviewed the requisition.
    public Guid? ReviewedByUserId { get; set; }

    public ApplicationUser? ReviewedByUser { get; set; }

    public DateTime? ReviewedAt { get; set; }

    // ---------------------------------------------------------
    // TIMESTAMPS
    // ---------------------------------------------------------

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public DateTime? ApprovedAt { get; set; }
}