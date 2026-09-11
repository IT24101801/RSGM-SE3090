using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.Skills;

public class CreateSkillRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }
}