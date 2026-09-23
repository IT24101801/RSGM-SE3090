using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.JobRequisitions;

public class RejectJobRequisitionRequest
{
    [Required]
    [MinLength(5)]
    [MaxLength(2000)]
    public string Feedback { get; set; } = string.Empty;
}