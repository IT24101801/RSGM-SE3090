using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.JobSeeker;

public class UpdateJobSeekerSkillProficiencyRequest
{
    [Required]
    [Range(1, 5)]
    public int ProficiencyLevel { get; set; }
}