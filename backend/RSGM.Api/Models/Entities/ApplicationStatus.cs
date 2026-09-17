namespace RSGM.Api.Models.Entities;

public enum ApplicationStatus
{
    UnderReview,
    Shortlisted,
    Interview,
    Offer,
    Rejected,
    Withdrawn
}

public class Application
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public Guid JobPostingId { get; set; }

    public ApplicationStatus Status { get; set; } = ApplicationStatus.UnderReview;

    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    public DateTime? WithdrawnAt { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public JobPosting JobPosting { get; set; } = null!;
}