namespace RSGM.Api.Models.DTOs.Jobs;

public class JobPostingResponse
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Company { get; set; } = string.Empty;

    public string? CompanyLogoUrl { get; set; }

    public string Location { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string EmploymentType { get; set; } = string.Empty;

    public string WorkMode { get; set; } = string.Empty;

    public string Responsibilities { get; set; } = string.Empty;

    public string Requirements { get; set; } = string.Empty;

    public string ExperienceLevel { get; set; } = string.Empty;

    public int? MinExperienceYears { get; set; }

    public decimal? MinSalary { get; set; }

    public decimal? MaxSalary { get; set; }

    public string? Currency { get; set; }

    public DateOnly? ApplicationDeadline { get; set; }

    public DateTime PostedDate { get; set; }

    public List<string> RequiredSkills { get; set; } = new();
}
