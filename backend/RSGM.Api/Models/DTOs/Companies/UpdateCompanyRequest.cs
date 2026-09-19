using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.Companies;

public class UpdateCompanyRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Url]
    [MaxLength(300)]
    public string? Website { get; set; }

    [Url]
    [MaxLength(500)]
    public string? LogoUrl { get; set; }
}
