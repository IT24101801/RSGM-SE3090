namespace RSGM.Api.Models.Entities;

public class Company
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string NormalizedName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<ApplicationUser> Users { get; set; }
        = new List<ApplicationUser>();

    public ICollection<JobPosting> JobPostings { get; set; }
        = new List<JobPosting>();
}
