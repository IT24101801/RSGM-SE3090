using RSGM.Api.Models.Entities;

namespace RSGM.Api.Models.DTOs.JobRequisitions;

public class JobRequisitionResponse
{
    public Guid Id { get; set; }

    public Guid CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public Guid RecruiterId { get; set; }

    public string RecruiterName { get; set; } = string.Empty;

    public string PositionTitle { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public int Headcount { get; set; }

    public EmploymentType EmploymentType { get; set; }

    public WorkMode WorkMode { get; set; }

    public string Location { get; set; } = string.Empty;

    public ExperienceLevel ExperienceLevel { get; set; }

    public int? MinExperienceYears { get; set; }

    public decimal? MinSalary { get; set; }

    public decimal? MaxSalary { get; set; }

    public string Currency { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Responsibilities { get; set; }

    public string? Requirements { get; set; }

    public string? Justification { get; set; }

    public JobRequisitionStatus Status { get; set; }

    public string? HrFeedback { get; set; }

    public Guid? ReviewedByUserId { get; set; }

    public string? ReviewedByName { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public DateTime? ApprovedAt { get; set; }
}