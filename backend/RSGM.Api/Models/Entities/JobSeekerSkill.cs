namespace RSGM.Api.Models.Entities;

public class JobSeekerSkill
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public Guid SkillId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = null!;

    public Skill Skill { get; set; } = null!;
}