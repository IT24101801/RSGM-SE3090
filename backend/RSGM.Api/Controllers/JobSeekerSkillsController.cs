using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/jobseeker/skills")]
[Authorize(Roles = AppRoles.JobSeeker)]
public class JobSeekerSkillsController : ControllerBase
{
    private readonly JobSeekerSkillService _skillService;

    public JobSeekerSkillsController(JobSeekerSkillService skillService)
    {
        _skillService = skillService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMySkills()
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var skills = await _skillService.GetByUserIdAsync(userId.Value);

        return Ok(skills);
    }

    [HttpPost]
    public async Task<IActionResult> AddSkill(AddJobSeekerSkillRequest request)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var added = await _skillService.AddAsync(userId.Value, request);

        if (added == null)
        {
            return Conflict(new
            {
                message = "This skill is already on your profile."
            });
        }

        return Ok(added);
    }

    [HttpDelete("{skillId:guid}")]
    public async Task<IActionResult> RemoveSkill(Guid skillId)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var removed = await _skillService.RemoveAsync(userId.Value, skillId);

        if (!removed)
        {
            return NotFound(new
            {
                message = "Skill not found on your profile."
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