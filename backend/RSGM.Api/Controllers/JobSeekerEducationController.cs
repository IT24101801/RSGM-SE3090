using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/jobseeker/education")]
[Authorize(Roles = AppRoles.JobSeeker)]
public class JobSeekerEducationController : ControllerBase
{
    private readonly JobSeekerEducationService _service;

    public JobSeekerEducationController(JobSeekerEducationService service)
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
        return item == null ? NotFound(new { message = "Education record not found." }) : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateEducationRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.CreateAsync(userId.Value, request);
        if (result.Result == EducationOperationResult.InvalidDates)
            return BadRequest(new { message = "Provide a valid date range, or select currently studying." });

        return CreatedAtAction(nameof(GetById), new { id = result.Education!.Id }, result.Education);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateEducationRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.UpdateAsync(userId.Value, id, request);
        return result.Result switch
        {
            EducationOperationResult.NotFound => NotFound(new { message = "Education record not found." }),
            EducationOperationResult.InvalidDates => BadRequest(new
                { message = "Provide a valid date range, or select currently studying." }),
            _ => Ok(result.Education)
        };
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.DeleteAsync(userId.Value, id);
        return result == EducationOperationResult.NotFound
            ? NotFound(new { message = "Education record not found." })
            : NoContent();
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
