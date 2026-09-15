using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.JobSeeker;

public class UpdateProfileRequest
{
    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? Headline { get; set; }

    [MaxLength(150)]
    public string? Location { get; set; }

    [MaxLength(1000)]
    public string? Bio { get; set; }
}