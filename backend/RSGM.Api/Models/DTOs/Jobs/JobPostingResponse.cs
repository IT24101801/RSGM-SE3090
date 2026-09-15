namespace RSGM.Api.Models.DTOs.Jobs;

public class JobPostingResponse
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Company { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string? Description { get; set; }

    public List<string> RequiredSkills { get; set; } = new();
}