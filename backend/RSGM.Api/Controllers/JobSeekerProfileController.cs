using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/jobseeker/profile")]
[Authorize(Roles = AppRoles.JobSeeker)]
public class JobSeekerProfileController : ControllerBase
{
    private readonly JobSeekerProfileService _profileService;

    public JobSeekerProfileController(
        JobSeekerProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var profile = await _profileService.GetByUserIdAsync(userId.Value);

        if (profile == null)
        {
            return NotFound(new
            {
                message = "Profile not found."
            });
        }

        return Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateMyProfile(
        UpdateProfileRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var updated = await _profileService.UpdateAsync(userId.Value, request);

        if (updated == null)
        {
            return NotFound(new
            {
                message = "Profile not found."
            });
        }

        return Ok(updated);
    }

    private Guid? GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(idClaim, out var id) ? id : null;
    }
}