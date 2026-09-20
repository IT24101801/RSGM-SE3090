namespace RSGM.Api.Models.Entities;

public enum InterviewStatus { Scheduled, Cancelled, Proposed, RescheduleRequested }
public enum OfferStatus { Draft, Submitted, Approved, Rejected, Withdrawn }

public class Interview
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ApplicationId { get; set; }
    public Guid RecruiterId { get; set; }
    public Guid PanelistId { get; set; }
    public Guid? HrManagerId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? LocationOrLink { get; set; }
    public InterviewStatus Status { get; set; } = InterviewStatus.Scheduled;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Application Application { get; set; } = null!;
    public ApplicationUser Recruiter { get; set; } = null!;
    public ApplicationUser Panelist { get; set; } = null!;
    public ApplicationUser? HrManager { get; set; }
    public InterviewFeedback? Feedback { get; set; }
}

public class InterviewFeedback
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid InterviewId { get; set; }
    public int TechnicalSkills { get; set; }
    public int ProblemSolving { get; set; }
    public int Communication { get; set; }
    public int CultureFit { get; set; }
    public string Recommendation { get; set; } = string.Empty;
    public string? Comments { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public Interview Interview { get; set; } = null!;
}

public class Offer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ApplicationId { get; set; }
    public Guid RecruiterId { get; set; }
    public decimal Salary { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public string? Notes { get; set; }
    public OfferStatus Status { get; set; } = OfferStatus.Draft;
    public string? RejectionReason { get; set; }
    public Guid? ReviewedByUserId { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Application Application { get; set; } = null!;
    public ApplicationUser Recruiter { get; set; } = null!;
    public ApplicationUser? ReviewedByUser { get; set; }
}

// Each HR decision is retained even when a rejected draft is revised and resubmitted.
public class OfferReview
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OfferId { get; set; }
    public Guid HrUserId { get; set; }
    public OfferStatus Decision { get; set; }
    public string? Reason { get; set; }
    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;
    public Offer Offer { get; set; } = null!;
    public ApplicationUser HrUser { get; set; } = null!;
}
