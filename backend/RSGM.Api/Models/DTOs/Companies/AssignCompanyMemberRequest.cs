using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.Companies;

public class AssignCompanyMemberRequest
{
    [Required]
    public Guid UserId { get; set; }
}
