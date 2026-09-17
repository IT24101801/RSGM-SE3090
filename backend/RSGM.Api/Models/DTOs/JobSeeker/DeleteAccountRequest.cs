using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.JobSeeker;

public class DeleteAccountRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;
}