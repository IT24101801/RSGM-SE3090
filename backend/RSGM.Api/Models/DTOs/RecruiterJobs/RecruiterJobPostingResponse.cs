namespace RSGM.Api.Models.DTOs.RecruiterJobs;

public class RecruiterJobPostingResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = string.Empty;
    public int ApplicantCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<RecruiterJobSkillResponse> RequiredSkills { get; set; } = new();
}

public class RecruiterJobSkillResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
