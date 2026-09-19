namespace RSGM.Api.Models.Entities;

public class JobSeekerProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // 1:1 link to the Identity user (ApplicationUser.Id)
    public Guid UserId { get; set; }

    public string? Headline { get; set; }

    public string? Location { get; set; }

    public string? Bio { get; set; }

    public string? LinkedInUrl { get; set; }

    public string? GitHubUrl { get; set; }

    public string? PortfolioUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ApplicationUser User { get; set; } = null!;
}
