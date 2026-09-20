namespace RSGM.Api.Models.Entities;

public enum NotificationKind
{
    InterviewScheduled,
    InterviewRescheduled,
    InterviewCancelled
}

public class UserNotification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RecipientId { get; set; }
    public Guid InterviewId { get; set; }
    public NotificationKind Kind { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }

    public ApplicationUser Recipient { get; set; } = null!;
}
