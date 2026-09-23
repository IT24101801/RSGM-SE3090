using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Models.DTOs.JobRequisitions;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/hr/requisitions")]
[Authorize(Roles = "HRManager")]
public class HrRequisitionsController
    : ControllerBase
{
    private readonly JobRequisitionService
        _service;

    public HrRequisitionsController(
        JobRequisitionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var result =
                await _service
                    .GetHrCompanyRequisitionsAsync(
                        GetUserId());

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

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id)
    {
        try
        {
            var result =
                await _service
                    .GetHrRequisitionAsync(
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

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(
        Guid id)
    {
        try
        {
            var result =
                await _service.ApproveAsync(
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

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(
        Guid id,
        RejectJobRequisitionRequest request)
    {
        try
        {
            var result =
                await _service.RejectAsync(
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