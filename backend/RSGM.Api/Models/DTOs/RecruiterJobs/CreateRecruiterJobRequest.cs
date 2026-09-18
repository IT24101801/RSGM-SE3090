using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.RecruiterJobs;

public class CreateRecruiterJobRequest
{
    [Required]
    [MaxLength(150)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Location { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public List<Guid> SkillIds { get; set; } = new();
}
