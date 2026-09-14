using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.JobSeeker;

public class AddJobSeekerSkillRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}