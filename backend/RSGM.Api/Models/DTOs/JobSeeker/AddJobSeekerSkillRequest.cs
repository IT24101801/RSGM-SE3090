using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.JobSeeker;

public class AddJobSeekerSkillRequest
{
    [Required]
    public Guid SkillId { get; set; }
}