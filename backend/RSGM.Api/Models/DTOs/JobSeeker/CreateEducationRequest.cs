using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.JobSeeker;

public class CreateEducationRequest
{
    [Required]
    [MaxLength(150)]
    public string Institution { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Degree { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? FieldOfStudy { get; set; }

    [Required]
    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public bool IsCurrent { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }
}
