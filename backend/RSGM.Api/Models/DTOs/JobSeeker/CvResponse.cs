namespace RSGM.Api.Models.DTOs.JobSeeker;

public class CvResponse
{
    public string FileName { get; set; } = string.Empty;

    public long FileSizeBytes { get; set; }

    public DateTime UploadedAt { get; set; }
}