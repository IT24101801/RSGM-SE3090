using System.ComponentModel.DataAnnotations;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Models.DTOs.JobRequisitions;

public class UpdateJobRequisitionRequest
{
    [Required]
    [MaxLength(150)]
    public string PositionTitle { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string Department { get; set; } = string.Empty;

    [Range(1, 1000)]
    public int Headcount { get; set; }

    [Required]
    public EmploymentType EmploymentType { get; set; }

    [Required]
    public WorkMode WorkMode { get; set; }

    [Required]
    [MaxLength(150)]
    public string Location { get; set; } = string.Empty;

    [Required]
    public ExperienceLevel ExperienceLevel { get; set; }

    [Range(0, 50)]
    public int? MinExperienceYears { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? MinSalary { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? MaxSalary { get; set; }

    [MaxLength(10)]
    public string Currency { get; set; } = "LKR";

    [MaxLength(3000)]
    public string? Description { get; set; }

    [MaxLength(3000)]
    public string? Responsibilities { get; set; }

    [MaxLength(3000)]
    public string? Requirements { get; set; }

    [MaxLength(2000)]
    public string? Justification { get; set; }
}