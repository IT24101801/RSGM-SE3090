namespace RSGM.Api.Models.DTOs.RecruiterJobs;

public class RecruiterApplicantDto
{
    public Guid Id { get; set; }

    public Guid JobPostingId { get; set; }

    public string JobTitle { get; set; } = string.Empty;

    public Guid CandidateId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? Headline { get; set; }

    public string? Location { get; set; }

    public string? Bio { get; set; }

    public string? LinkedInUrl { get; set; }

    public string? GitHubUrl { get; set; }

    public string? PortfolioUrl { get; set; }

    public bool HasCv { get; set; }

    public string? CvFileName { get; set; }

    public string Status { get; set; } = string.Empty;

    public int? ShortlistRank { get; set; }

    public DateTime AppliedAt { get; set; }

    public int MatchScore { get; set; }

    public List<string> Skills { get; set; } = new();

    public List<string> MatchedSkills { get; set; } = new();

    public List<string> MissingSkills { get; set; } = new();

    public List<string> Education { get; set; } = new();

    public List<string> WorkExperience { get; set; } = new();
}

public class ReviewApplicantRequest
{
    public string Status { get; set; } = string.Empty;
}

public class RankShortlistRequest
{
    public List<Guid> OrderedApplicationIds { get; set; } = new();
}