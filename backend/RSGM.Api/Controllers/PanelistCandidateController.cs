using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Common;
using RSGM.Api.Data;
using RSGM.Api.Models.Entities;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.HiringPanelist)]
[Route("api/hiring/panelist/shortlists")]
public class PanelistCandidateController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly JobSeekerCvService _cvService;

    public PanelistCandidateController(
        ApplicationDbContext db,
        JobSeekerCvService cvService)
    {
        _db = db;
        _cvService = cvService;
    }

    private Guid UserId =>
        Guid.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out var id)
            ? id
            : Guid.Empty;

    private IQueryable<ShortlistDispatchCandidate> AccessibleCandidates =>
        _db.ShortlistDispatchCandidates.Where(candidate =>
            candidate.Dispatch.PanelistId == UserId &&
            candidate.Application.Status == ApplicationStatus.Shortlisted &&
            candidate.Dispatch.JobPosting.CompanyId != null &&
            candidate.Dispatch.JobPosting.CompanyEntity != null &&
            candidate.Dispatch.JobPosting.CompanyEntity.IsActive &&
            _db.CompanyMembers.Any(member =>
                member.UserId == UserId &&
                member.IsActive &&
                member.Company.IsActive &&
                member.CompanyId ==
                    candidate.Dispatch.JobPosting.CompanyId));

    [HttpGet("applications/{applicationId:guid}/candidate")]
    public async Task<IActionResult> GetCandidate(Guid applicationId)
    {
        var application = await AccessibleCandidates
            .Where(candidate =>
                candidate.ApplicationId == applicationId)
            .Select(candidate => candidate.Application)
            .Include(application => application.User)
            .Include(application => application.JobPosting)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (application == null)
        {
            return NotFound(new
            {
                message =
                    "This shortlisted candidate is not available to you."
            });
        }

        var candidateId = application.UserId;

        var profile = await _db.JobSeekerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(profile =>
                profile.UserId == candidateId);

        var skills = await _db.JobSeekerSkills
            .AsNoTracking()
            .Where(skill =>
                skill.UserId == candidateId)
            .Select(skill => new
            {
                skill.Skill.Name,
                skill.ProficiencyLevel
            })
            .OrderBy(skill => skill.Name)
            .ToListAsync();

        var education = await _db.EducationRecords
            .AsNoTracking()
            .Where(record =>
                record.UserId == candidateId)
            .OrderByDescending(record =>
                record.StartDate)
            .Select(record => new
            {
                record.Degree,
                record.Institution,
                record.FieldOfStudy,
                record.StartDate,
                record.EndDate,
                record.IsCurrent
            })
            .ToListAsync();

        var experience = await _db.WorkExperiences
            .AsNoTracking()
            .Where(record =>
                record.UserId == candidateId)
            .OrderByDescending(record =>
                record.StartDate)
            .Select(record => new
            {
                record.JobTitle,
                record.CompanyName,
                record.Location,
                record.StartDate,
                record.EndDate,
                record.IsCurrent
            })
            .ToListAsync();

        var cv = await _db.JobSeekerCvs
            .AsNoTracking()
            .Where(record =>
                record.UserId == candidateId)
            .Select(record => new
            {
                record.FileName
            })
            .FirstOrDefaultAsync();

        return Ok(new
        {
            Id = application.Id,
            JobTitle =
                application.JobPosting.Title,
            FullName =
                application.User.FullName,
            Email =
                application.User.Email,
            PhoneNumber =
                application.User.PhoneNumber,

            Headline =
                profile?.Headline,
            Location =
                profile?.Location,
            Bio =
                profile?.Bio,

            LinkedInUrl =
                profile?.LinkedInUrl,
            GitHubUrl =
                profile?.GitHubUrl,
            PortfolioUrl =
                profile?.PortfolioUrl,

            Skills = skills,
            Education = education,
            WorkExperience = experience,

            HasCv = cv != null,
            CvFileName =
                cv?.FileName
        });
    }

    [HttpGet("applications/{applicationId:guid}/cv")]
    public async Task<IActionResult> DownloadCv(Guid applicationId)
    {
        var candidateId = await AccessibleCandidates
            .AsNoTracking()
            .Where(candidate =>
                candidate.ApplicationId == applicationId)
            .Select(candidate =>
                (Guid?)candidate.Application.UserId)
            .FirstOrDefaultAsync();

        if (candidateId == null)
        {
            return NotFound(new
            {
                message =
                    "This shortlisted candidate is not available to you."
            });
        }

        var cv =
            await _cvService.GetFileForDownloadAsync(
                candidateId.Value);

        if (cv == null)
        {
            return NotFound(new
            {
                message =
                    "No CV is available for this candidate."
            });
        }

        return File(
            cv.Value.Stream,
            cv.Value.ContentType,
            cv.Value.FileName);
    }
}