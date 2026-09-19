using Microsoft.AspNetCore.Identity;

namespace RSGM.Api.Models.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<CompanyMember> CompanyMemberships { get; set; }
        = new List<CompanyMember>();

    public ICollection<JobPosting> CreatedJobPostings { get; set; }
        = new List<JobPosting>();
}
