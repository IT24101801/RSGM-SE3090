using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.JobSeeker;

public class AddJobSeekerSkillRequest
{
    [Required]
    public Guid SkillId { get; set; }

    [Range(1, 5)]
    public int ProficiencyLevel { get; set; } = 3;
}