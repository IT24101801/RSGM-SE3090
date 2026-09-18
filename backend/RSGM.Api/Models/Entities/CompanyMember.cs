namespace RSGM.Api.Models.Entities;

public class CompanyMember
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CompanyId { get; set; }

    public Guid UserId { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public Company Company { get; set; } = null!;

    public ApplicationUser User { get; set; } = null!;
}
