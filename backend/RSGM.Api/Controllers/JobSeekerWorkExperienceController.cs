using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/jobseeker/work-experience")]
[Authorize(Roles = AppRoles.JobSeeker)]
public class JobSeekerWorkExperienceController : ControllerBase
{
    private readonly JobSeekerWorkExperienceService _service;

    public JobSeekerWorkExperienceController(JobSeekerWorkExperienceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetCurrentUserId();
        return userId == null ? Unauthorized() : Ok(await _service.GetAllAsync(userId.Value));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var item = await _service.GetByIdAsync(userId.Value, id);
        return item == null ? NotFound(new { message = "Work experience not found." }) : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateWorkExperienceRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.CreateAsync(userId.Value, request);
        if (result.Result == WorkExperienceOperationResult.InvalidDates)
            return BadRequest(new { message = "Provide a valid date range, or select currently working here." });

        return CreatedAtAction(nameof(GetById), new { id = result.Experience!.Id }, result.Experience);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateWorkExperienceRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.UpdateAsync(userId.Value, id, request);
        return result.Result switch
        {
            WorkExperienceOperationResult.NotFound => NotFound(new { message = "Work experience not found." }),
            WorkExperienceOperationResult.InvalidDates => BadRequest(new
                { message = "Provide a valid date range, or select currently working here." }),
            _ => Ok(result.Experience)
        };
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.DeleteAsync(userId.Value, id);
        return result == WorkExperienceOperationResult.NotFound
            ? NotFound(new { message = "Work experience not found." })
            : NoContent();
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
