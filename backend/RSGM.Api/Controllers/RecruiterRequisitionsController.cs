using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Models.DTOs.JobRequisitions;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/recruiter/requisitions")]
[Authorize(Roles = "Recruiter")]
public class RecruiterRequisitionsController
    : ControllerBase
{
    private readonly JobRequisitionService
        _service;

    public RecruiterRequisitionsController(
        JobRequisitionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();

        var result =
            await _service
                .GetRecruiterRequisitionsAsync(
                    userId);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id)
    {
        var result =
            await _service
                .GetRecruiterRequisitionAsync(
                    GetUserId(),
                    id);

        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateJobRequisitionRequest request)
    {
        try
        {
            var result =
                await _service.CreateAsync(
                    GetUserId(),
                    request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Id },
                result);
        }
        catch (
            InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message = ex.Message
                });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateJobRequisitionRequest request)
    {
        try
        {
            var result =
                await _service.UpdateAsync(
                    GetUserId(),
                    id,
                    request);

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }
        catch (
            InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message = ex.Message
                });
        }
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(
        Guid id)
    {
        try
        {
            var result =
                await _service.SubmitAsync(
                    GetUserId(),
                    id);

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }
        catch (
            InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message = ex.Message
                });
        }
    }

    private Guid GetUserId()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (
            string.IsNullOrWhiteSpace(
                userId) ||
            !Guid.TryParse(
                userId,
                out var parsedId))
        {
            throw new UnauthorizedAccessException();
        }

        return parsedId;
    }
}