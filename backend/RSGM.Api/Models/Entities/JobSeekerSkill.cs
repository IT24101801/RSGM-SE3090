namespace RSGM.Api.Models.Entities;

public class JobSeekerSkill
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public Guid SkillId { get; set; }

    // 1 = Beginner
    // 2 = Basic
    // 3 = Intermediate
    // 4 = Advanced
    // 5 = Expert
    public int ProficiencyLevel { get; set; } = 3;

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ApplicationUser User { get; set; } = null!;

    public Skill Skill { get; set; } = null!;
}