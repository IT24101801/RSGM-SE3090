using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Models.DTOs.AdminUsers;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = AppRoles.SystemAdmin)]
public class AdminUsersController : ControllerBase
{
    private readonly AdminUserService _adminUserService;

    public AdminUsersController(AdminUserService adminUserService) => _adminUserService = adminUserService;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _adminUserService.GetAllAsync());

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateUserStatusRequest request)
    {
        var currentAdminId = GetCurrentUserId();
        if (currentAdminId == null) return Unauthorized();

        return ToActionResult(await _adminUserService.UpdateStatusAsync(
            currentAdminId.Value, id, request.IsActive));
    }

    [HttpPatch("{id:guid}/role")]
    public async Task<IActionResult> UpdateRole(Guid id, UpdateUserRoleRequest request)
    {
        var currentAdminId = GetCurrentUserId();
        if (currentAdminId == null) return Unauthorized();

        return ToActionResult(await _adminUserService.UpdateRoleAsync(
            currentAdminId.Value, id, request.Role, request.CompanyId));
    }

    private IActionResult ToActionResult(
        (AdminUserUpdateResult Result, AdminUserResponse? User, IEnumerable<string> Errors) result)
    {
        return result.Result switch
        {
            AdminUserUpdateResult.NotFound => NotFound(new { message = "User not found." }),
            AdminUserUpdateResult.InvalidRole => BadRequest(new { message = "The selected role is invalid." }),
            AdminUserUpdateResult.CompanyRequired => BadRequest(new { message = "Select a registered company when assigning a staff role." }),
            AdminUserUpdateResult.InvalidCompany => BadRequest(new { message = "The selected company does not exist or is inactive." }),
            AdminUserUpdateResult.CannotModifySelf => BadRequest(new
                { message = "You cannot change your own role or account status." }),
            AdminUserUpdateResult.LastSystemAdmin => BadRequest(new
                { message = "The final active System Administrator cannot be deactivated or reassigned." }),
            AdminUserUpdateResult.Failed => BadRequest(new
                { message = "Unable to update the user.", errors = result.Errors }),
            _ => Ok(result.User)
        };
    }

    private Guid? GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(idClaim, out var id) ? id : null;
    }
}
