namespace RSGM.Api.Models.DTOs.JobSeeker;

public class ProfileResponse
{
    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Headline { get; set; }

    public string? Location { get; set; }

    public string? Bio { get; set; }
}