using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.JobSeeker;

public class UpdateWorkExperienceRequest
{
    [Required]
    [MaxLength(150)]
    public string JobTitle { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string CompanyName { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? Location { get; set; }

    [Required]
    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public bool IsCurrent { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }
}
