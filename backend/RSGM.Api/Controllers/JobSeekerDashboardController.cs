using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/jobseeker/dashboard")]
[Authorize(Roles = AppRoles.JobSeeker)]
public class JobSeekerDashboardController : ControllerBase
{
    private readonly JobSeekerDashboardService _dashboardService;

    public JobSeekerDashboardController(
        JobSeekerDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<IActionResult> GetStats()
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var stats = await _dashboardService.GetStatsAsync(userId.Value);

        return Ok(stats);
    }

    private Guid? GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(idClaim, out var id) ? id : null;
    }
}
