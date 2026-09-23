namespace RSGM.Api.Models.Entities;

public class JobPostingSkill
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid JobPostingId { get; set; }

    public Guid SkillId { get; set; }

    // Importance of this skill for the job.
    // Example:
    // React = 0.40
    // TypeScript = 0.30
    // Testing = 0.20
    // GraphQL = 0.10
    public decimal Weight { get; set; } = 1.0m;

    public JobPosting JobPosting { get; set; } = null!;

    public Skill Skill { get; set; } = null!;
}