namespace RSGM.Api.Models.Entities;

public class JobSeekerCv
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // 1:1 link to the Identity user (ApplicationUser.Id)
    public Guid UserId { get; set; }

    // Original filename as uploaded, shown back to the user.
    public string FileName { get; set; } = string.Empty;

    // Generated filename actually used on disk — never trust the
    // original filename for storage (path traversal / collisions).
    public string StoredFileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public long FileSizeBytes { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = null!;
}