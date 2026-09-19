namespace RSGM.Api.Models.DTOs.JobSeeker;

public class JobSeekerSkillResponse
{
    public Guid SkillId { get; set; }

    public string Name { get; set; } = string.Empty;

    public int ProficiencyLevel { get; set; }
}