using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.RecruiterJobs;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.Recruiter)]
[Route("api/recruiter/applications")]
public class RecruiterApplicationsController : ControllerBase
{
    private readonly RecruiterApplicantService _applicants;
    private readonly JobSeekerCvService _cvs;

    public RecruiterApplicationsController(
        ApplicationDbContext db,
        JobSeekerCvService cvs)
    {
        _applicants = new RecruiterApplicantService(db);
        _cvs = cvs;
    }

    [HttpGet]
    public async Task<IActionResult> GetMine([FromQuery] Guid? jobId)
    {
        var recruiterId = CurrentUserId();

        return recruiterId == null
            ? Unauthorized()
            : Ok(await _applicants.GetMineAsync(
                recruiterId.Value,
                jobId));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOne(Guid id)
    {
        var recruiterId = CurrentUserId();

        if (recruiterId == null)
        {
            return Unauthorized();
        }

        var applicant =
            (await _applicants.GetMineAsync(recruiterId.Value))
            .FirstOrDefault(a => a.Id == id);

        return applicant == null
            ? NotFound()
            : Ok(applicant);
    }

    [HttpPatch("{id:guid}/decision")]
    public async Task<IActionResult> Review(
        Guid id,
        ReviewApplicantRequest request)
    {
        var recruiterId = CurrentUserId();

        if (recruiterId == null)
        {
            return Unauthorized();
        }

        var (result, applicant) =
            await _applicants.ReviewAsync(
                recruiterId.Value,
                id,
                request.Status);

        return result switch
        {
            RecruiterReviewResult.NotFound => NotFound(),

            RecruiterReviewResult.InvalidStatus =>
                BadRequest(new
                {
                    message =
                        "Choose UnderReview, Shortlisted, or Rejected."
                }),

            RecruiterReviewResult.Locked =>
                Conflict(new
                {
                    message =
                        "This application can no longer be reviewed."
                }),

            _ => Ok(applicant)
        };
    }

    [HttpPut("jobs/{jobId:guid}/shortlist/rank")]
    public async Task<IActionResult> Rank(
        Guid jobId,
        RankShortlistRequest request)
    {
        var recruiterId = CurrentUserId();

        if (recruiterId == null)
        {
            return Unauthorized();
        }

        var result = await _applicants.RankAsync(
            recruiterId.Value,
            jobId,
            request.OrderedApplicationIds);

        return result switch
        {
            RecruiterReviewResult.NotFound => NotFound(),

            RecruiterReviewResult.InvalidRanking =>
                BadRequest(new
                {
                    message =
                        "Include each shortlisted applicant exactly once."
                }),

            _ => Ok(await _applicants.GetMineAsync(
                recruiterId.Value,
                jobId))
        };
    }

    [HttpGet("{id:guid}/cv")]
    public async Task<IActionResult> DownloadCv(Guid id)
    {
        var recruiterId = CurrentUserId();

        if (recruiterId == null)
        {
            return Unauthorized();
        }

        var application =
            await _applicants.GetOwnedApplicationAsync(
                recruiterId.Value,
                id);

        if (application == null)
        {
            return NotFound();
        }

        var cv = await _cvs.GetFileForDownloadAsync(
            application.UserId);

        return cv == null
            ? NotFound(new { message = "No CV is available." })
            : File(
                cv.Value.Stream,
                cv.Value.ContentType,
                cv.Value.FileName);
    }

    private Guid? CurrentUserId() =>
        Guid.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out var id)
            ? id
            : null;
}