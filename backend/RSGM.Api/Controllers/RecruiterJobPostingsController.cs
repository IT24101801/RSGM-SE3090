using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Models.DTOs.RecruiterJobs;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/recruiter/postings")]
[Authorize(Roles = AppRoles.Recruiter)]
public class RecruiterJobPostingsController : ControllerBase
{
    private readonly RecruiterJobPostingService _service;

    public RecruiterJobPostingsController(RecruiterJobPostingService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.GetMineAsync(userId.Value);
        return result.Result switch
        {
            RecruiterJobResult.NoCompany => BadRequest(new
                { message = "Ask the System Administrator to assign your account to a company." }),
            RecruiterJobResult.CompanyInactive => Forbid(),
            _ => Ok(result.Jobs)
        };
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        return ToActionResult(await _service.GetMineByIdAsync(userId.Value, id));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateRecruiterJobRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.CreateAsync(userId.Value, request);
        if (result.Result != RecruiterJobResult.Success)
            return ToActionResult(result);

        return CreatedAtAction(nameof(GetById), new { id = result.Job!.Id }, result.Job);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateRecruiterJobRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        return ToActionResult(await _service.UpdateAsync(userId.Value, id, request));
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        UpdateRecruiterJobStatusRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        return ToActionResult(await _service.UpdateStatusAsync(
            userId.Value, id, request.Status));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _service.DeleteAsync(userId.Value, id);
        return result switch
        {
            RecruiterJobResult.NotFound => NotFound(new { message = "Job posting not found." }),
            RecruiterJobResult.NoCompany => BadRequest(new
                { message = "Ask the System Administrator to assign your account to a company." }),
            RecruiterJobResult.CompanyInactive => BadRequest(new
                { message = "Your company is inactive." }),
            RecruiterJobResult.HasApplications => Conflict(new
                { message = "A job posting with applications cannot be deleted. Close it instead." }),
            _ => NoContent()
        };
    }

    private IActionResult ToActionResult(
        (RecruiterJobResult Result, RecruiterJobPostingResponse? Job) result)
    {
        return result.Result switch
        {
            RecruiterJobResult.NotFound => NotFound(new { message = "Job posting not found." }),
            RecruiterJobResult.NoCompany => BadRequest(new
                { message = "Ask the System Administrator to assign your account to a company." }),
            RecruiterJobResult.CompanyInactive => BadRequest(new
                { message = "Your company is inactive." }),
            RecruiterJobResult.InvalidSkills => BadRequest(new
                { message = "One or more selected skills are invalid or inactive." }),
            RecruiterJobResult.InvalidStatus => BadRequest(new
                { message = "Status must be Draft, Published, or Closed." }),
            RecruiterJobResult.ClosedJob => Conflict(new
                { message = "A closed job posting cannot be reopened or edited." }),
            _ => Ok(result.Job)
        };
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
