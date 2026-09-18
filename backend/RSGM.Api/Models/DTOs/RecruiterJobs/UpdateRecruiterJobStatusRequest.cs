using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.RecruiterJobs;

public class UpdateRecruiterJobStatusRequest
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
