namespace RSGM.Api.Models.Entities;

public enum JobPostingStatus
{
    Draft,
    Published,
    Closed
}

public enum EmploymentType
{
    FullTime,
    PartTime,
    Contract,
    Internship
}

public enum WorkMode
{
    OnSite,
    Remote,
    Hybrid
}

public enum ExperienceLevel
{
    Entry,
    Junior,
    Mid,
    Senior
}

public class JobPosting
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Title { get; set; } = string.Empty;

    // Kept temporarily so existing seeded jobs continue to work.
    // New recruiter-created jobs also use the CompanyId relationship below.
    public string Company { get; set; } = string.Empty;

    public Guid? CompanyId { get; set; }

    public Guid? CreatedByUserId { get; set; }

    public string Location { get; set; } = string.Empty;

    public EmploymentType EmploymentType { get; set; }

    public WorkMode WorkMode { get; set; }

    public string? Description { get; set; }

    public string Responsibilities { get; set; } = string.Empty;

    public string Requirements { get; set; } = string.Empty;

    public ExperienceLevel ExperienceLevel { get; set; }

    public int? MinExperienceYears { get; set; }

    public decimal? MinSalary { get; set; }

    public decimal? MaxSalary { get; set; }

    public string? Currency { get; set; }

    // Nullable so pre-existing jobs can survive the migration. New recruiter
    // postings always receive a validated future deadline.
    public DateOnly? ApplicationDeadline { get; set; }

    public JobPostingStatus Status { get; set; } = JobPostingStatus.Draft;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public Company? CompanyEntity { get; set; }

    public ApplicationUser? CreatedByUser { get; set; }

    public ICollection<JobPostingSkill> RequiredSkills { get; set; }
        = new List<JobPostingSkill>();

    public ICollection<Application> Applications { get; set; }
        = new List<Application>();
}
