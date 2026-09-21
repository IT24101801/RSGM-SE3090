namespace RSGM.Api.Models.Entities;

public class ShortlistDispatch
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobPostingId { get; set; }
    public Guid RecruiterId { get; set; }
    public Guid PanelistId { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public JobPosting JobPosting { get; set; } = null!;
    public ApplicationUser Recruiter { get; set; } = null!;
    public ApplicationUser Panelist { get; set; } = null!;
    public ICollection<ShortlistDispatchCandidate> Candidates { get; set; } = new List<ShortlistDispatchCandidate>();
}

public class ShortlistDispatchCandidate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DispatchId { get; set; }
    public Guid ApplicationId { get; set; }
    public int Rank { get; set; }
    public ShortlistDispatch Dispatch { get; set; } = null!;
    public Application Application { get; set; } = null!;
}

public class UserBusyTime
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ApplicationUser User { get; set; } = null!;
}

public class CandidateRecommendation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InterviewId { get; set; }
    public Guid PanelistId { get; set; }
    public Guid HrManagerId { get; set; }
    public bool Selected { get; set; }
    public string Rationale { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public Interview Interview { get; set; } = null!;
    public ApplicationUser Panelist { get; set; } = null!;
    public ApplicationUser HrManager { get; set; } = null!;
}
