using Microsoft.AspNetCore.Identity;

namespace RSGM.Api.Models.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Nullable because public JobSeeker registration does not
    // belong to a company.
    //
    // Recruiter, HRManager and HiringPanelist accounts should
    // have a CompanyId assigned.
    public Guid? CompanyId { get; set; }

    public Company? Company { get; set; }
}