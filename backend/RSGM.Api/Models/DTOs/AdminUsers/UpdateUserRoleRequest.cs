using System.ComponentModel.DataAnnotations;

namespace RSGM.Api.Models.DTOs.AdminUsers;

public class UpdateUserRoleRequest
{
    [Required]
    public string Role { get; set; } = string.Empty;

    public Guid? CompanyId { get; set; }
}
