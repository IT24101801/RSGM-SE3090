using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.JobSeeker;

public class CreateApplicationRequest
{
    [Required]
    public Guid JobPostingId { get; set; }
}