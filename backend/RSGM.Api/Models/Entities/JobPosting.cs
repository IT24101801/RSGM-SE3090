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

    public string Company { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string? Description { get; set; }

    public JobPostingStatus Status { get; set; } = JobPostingStatus.Draft;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<JobPostingSkill> RequiredSkills { get; set; }
        = new List<JobPostingSkill>();
}