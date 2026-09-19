namespace RSGM.Api.Models.Entities;

public enum JobPostingStatus
{
    Draft,
    Published,
    Closed
}

public class JobPosting
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    // Kept temporarily for backward compatibility with the
    // existing Job Seeker UI and DTOs.
    //
    // CompanyId is now the authoritative relationship.
    public string Company { get; set; } = string.Empty;

    public Guid? CompanyId { get; set; }

    public Company? CompanyEntity { get; set; }

    // The recruiter who originally created the posting.
    public Guid? CreatedByUserId { get; set; }

    public ApplicationUser? CreatedByUser { get; set; }

    public string Location { get; set; } = string.Empty;

    public string? Description { get; set; }

    public JobPostingStatus Status { get; set; }
        = JobPostingStatus.Draft;

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<JobPostingSkill> RequiredSkills { get; set; }
        = new List<JobPostingSkill>();
}