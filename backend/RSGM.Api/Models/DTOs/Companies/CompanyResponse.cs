namespace RSGM.Api.Models.DTOs.Companies;

public class CompanyResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; }
    public int MemberCount { get; set; }
    public int JobPostingCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
