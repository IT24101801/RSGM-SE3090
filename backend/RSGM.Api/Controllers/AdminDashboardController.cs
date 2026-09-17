using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = AppRoles.SystemAdmin)]
public class AdminDashboardController : ControllerBase
{
    private readonly AdminDashboardService _dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        return Ok(await _dashboardService.GetStatsAsync());
    }
}
