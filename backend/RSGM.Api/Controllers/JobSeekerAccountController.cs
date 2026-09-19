using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/jobseeker/account")]
[Authorize(Roles = AppRoles.JobSeeker)]
public class JobSeekerAccountController : ControllerBase
{
    private readonly JobSeekerAccountService _accountService;

    public JobSeekerAccountController(
        JobSeekerAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteMyAccount(
        DeleteAccountRequest request)
    {
        var idClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(idClaim, out var userId))
        {
            return Unauthorized();
        }

        var (result, errors) =
            await _accountService.DeleteAsync(
                userId,
                request.CurrentPassword);

        return result switch
        {
            DeleteJobSeekerAccountResult.UserNotFound =>
                NotFound(new
                {
                    message = "Account not found."
                }),

            DeleteJobSeekerAccountResult.InvalidPassword =>
                BadRequest(new
                {
                    message = "The current password is incorrect."
                }),

            DeleteJobSeekerAccountResult.Failed =>
                BadRequest(new
                {
                    message = "Could not delete the account.",
                    errors
                }),

            _ => Ok(new
            {
                message =
                    "Job seeker account deleted successfully."
            })
        };
    }
}