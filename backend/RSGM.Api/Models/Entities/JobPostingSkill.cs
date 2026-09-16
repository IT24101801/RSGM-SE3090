namespace RSGM.Api.Models.Entities;

public class JobPostingSkill
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid JobPostingId { get; set; }

    public Guid SkillId { get; set; }

    public JobPosting JobPosting { get; set; } = null!;

    public Skill Skill { get; set; } = null!;
}