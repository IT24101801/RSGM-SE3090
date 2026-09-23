namespace RSGM.Api.Models.Entities;

public class Company
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string NormalizedName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Website { get; set; }

    public string? LogoUrl { get; set; }

    public int CurrentEmployeeCount { get; set; }

    public int WorkingLocationCount { get; set; }

    public string? OrganizationType { get; set; }

    public string? MainDepartments { get; set; }

    public string? MajorSkillRequirements { get; set; }

    public DateTime? HrProfileCompletedAt { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<CompanyMember> Members { get; set; }
        = new List<CompanyMember>();

    public ICollection<JobPosting> JobPostings { get; set; }
        = new List<JobPosting>();
}
