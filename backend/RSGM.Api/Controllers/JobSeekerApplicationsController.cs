using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/jobseeker/applications")]
[Authorize(Roles = AppRoles.JobSeeker)]
public class JobSeekerApplicationsController : ControllerBase
{
    private readonly JobSeekerApplicationService _applicationService;

    public JobSeekerApplicationsController(
        JobSeekerApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyApplications()
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var applications = await _applicationService.GetByUserIdAsync(userId.Value);

        return Ok(applications);
    }

    [HttpPost]
    public async Task<IActionResult> Apply(CreateApplicationRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var (result, application) = await _applicationService.CreateAsync(userId.Value, request);

        return result switch
        {
            CreateApplicationResult.Success => Ok(application),
            CreateApplicationResult.AlreadyApplied => Conflict(new
            {
                message = "You've already applied to this job."
            }),
            CreateApplicationResult.JobNotFound => NotFound(new
            {
                message = "This job posting is no longer available."
            }),
            _ => BadRequest()
        };
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Withdraw(Guid id)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var withdrawn = await _applicationService.WithdrawAsync(userId.Value, id);

        if (!withdrawn)
        {
            return NotFound(new
            {
                message = "Application not found or already withdrawn."
            });
        }

        return NoContent();
    }

    private Guid? GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(idClaim, out var id) ? id : null;
    }
}