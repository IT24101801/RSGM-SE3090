using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Common;
using RSGM.Api.Data;
using RSGM.Api.Models.Entities;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

public record ScheduleInterviewRequest(Guid ApplicationId, Guid PanelistId,
    DateTimeOffset ScheduledAt, string Type, string? LocationOrLink);
public record RescheduleInterviewRequest(DateTimeOffset ScheduledAt);
public record SaveFeedbackRequest(int TechnicalSkills, int ProblemSolving,
    int Communication, int CultureFit, string Recommendation, string? Comments);
public record SaveOfferRequest(Guid ApplicationId, decimal Salary, string Currency,
    DateOnly StartDate, string? Notes);
public record RejectOfferRequest(string Reason);

[ApiController]
[Authorize]
[Route("api")]
public class HiringWorkflowController : ControllerBase
{
    private const int InterviewDurationMinutes = 60;
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationUser> _users;
    private readonly JobSeekerCvService _cvs;
    private readonly TimeZoneInfo _officeTimeZone;

    public HiringWorkflowController(ApplicationDbContext db, UserManager<ApplicationUser> users,
        JobSeekerCvService cvs, IConfiguration configuration)
    {
        _db = db;
        _users = users;
        _cvs = cvs;
        _officeTimeZone = TimeZoneInfo.FindSystemTimeZoneById(
            configuration["Hiring:TimeZoneId"] ?? "Asia/Colombo");
    }

    private bool IsOfficeTime(DateTimeOffset when)
    {
        var time = TimeZoneInfo.ConvertTime(when, _officeTimeZone).TimeOfDay;
        return time >= TimeSpan.FromHours(8) &&
            time + TimeSpan.FromMinutes(InterviewDurationMinutes) <= TimeSpan.FromHours(17);
    }

    private Guid UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
        ? id : Guid.Empty;

    private IQueryable<Application> MyApplications => _db.Applications.Where(a =>
        a.JobPosting.CreatedByUserId == UserId && a.JobPosting.CompanyId != null &&
        a.JobPosting.CompanyEntity != null && a.JobPosting.CompanyEntity.IsActive &&
        _db.CompanyMembers.Any(m => m.UserId == UserId && m.IsActive &&
            m.CompanyId == a.JobPosting.CompanyId));

    private IQueryable<Interview> MyInterviews => _db.Interviews.Where(i =>
        i.RecruiterId == UserId && i.Application.JobPosting.CreatedByUserId == UserId &&
        i.Application.JobPosting.CompanyId != null &&
        i.Application.JobPosting.CompanyEntity != null &&
        i.Application.JobPosting.CompanyEntity.IsActive &&
        _db.CompanyMembers.Any(m => m.UserId == UserId && m.IsActive &&
            m.CompanyId == i.Application.JobPosting.CompanyId));

    private IQueryable<Offer> MyOffers => _db.Offers.Where(o =>
        o.RecruiterId == UserId && o.Application.JobPosting.CreatedByUserId == UserId &&
        o.Application.JobPosting.CompanyId != null &&
        o.Application.JobPosting.CompanyEntity != null &&
        o.Application.JobPosting.CompanyEntity.IsActive &&
        _db.CompanyMembers.Any(m => m.UserId == UserId && m.IsActive &&
            m.CompanyId == o.Application.JobPosting.CompanyId));

    private IQueryable<Offer> CompanyOffers => _db.Offers.Where(o =>
        o.Application.JobPosting.CompanyId != null &&
        o.Application.JobPosting.CompanyEntity != null &&
        o.Application.JobPosting.CompanyEntity.IsActive &&
        _db.CompanyMembers.Any(m => m.UserId == UserId && m.IsActive &&
            m.CompanyId == o.Application.JobPosting.CompanyId));

    private static object InterviewDto(Interview i) => new
    {
        i.Id, i.ApplicationId, Candidate = i.Application.User.FullName,
        Job = i.Application.JobPosting.Title, i.PanelistId,
        Panelist = i.Panelist.FullName, i.ScheduledAt, i.Type, i.LocationOrLink,
        Status = i.Status.ToString(), i.CreatedAt,
        CandidateEmail = i.Application.User.Email,
        Feedback = i.Feedback == null ? null : new
        {
            i.Feedback.TechnicalSkills, i.Feedback.ProblemSolving,
            i.Feedback.Communication, i.Feedback.CultureFit,
            i.Feedback.Recommendation, i.Feedback.Comments,
            i.Feedback.SubmittedAt
        }
    };

    private static object OfferDto(Offer o) => new
    {
        o.Id, o.ApplicationId, Candidate = o.Application.User.FullName,
        Job = o.Application.JobPosting.Title, o.Salary, o.Currency, o.StartDate,
        o.Notes, Status = o.Status.ToString(), o.RejectionReason, o.RecruiterId,
        SubmittedBy = o.Recruiter.FullName, o.SubmittedAt, o.ReviewedAt,
        o.ReviewedByUserId, o.CreatedAt
    };

    private IQueryable<Interview> InterviewsWithDetails(IQueryable<Interview> query) => query
        .Include(i => i.Application).ThenInclude(a => a.User)
        .Include(i => i.Application).ThenInclude(a => a.JobPosting)
        .Include(i => i.Panelist).Include(i => i.Feedback);

    private IQueryable<Offer> OffersWithDetails(IQueryable<Offer> query) => query
        .Include(o => o.Application).ThenInclude(a => a.User)
        .Include(o => o.Application).ThenInclude(a => a.JobPosting)
        .Include(o => o.Recruiter);

    [HttpGet("recruiter/interviews/office-hours")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public IActionResult OfficeHours() => Ok(new
    {
        timeZoneId = _officeTimeZone.Id,
        startsAt = "08:00",
        endsAt = "17:00",
        durationMinutes = InterviewDurationMinutes
    });

    [HttpGet("recruiter/panelists")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public async Task<IActionResult> Panelists()
    {
        var companyIds = _db.CompanyMembers.Where(m => m.UserId == UserId && m.IsActive && m.Company.IsActive)
            .Select(m => m.CompanyId);
        var ids = await _db.UserRoles.Join(_db.Roles, ur => ur.RoleId, r => r.Id,
            (ur, r) => new { ur.UserId, r.Name })
            .Where(x => x.Name == AppRoles.HiringPanelist).Select(x => x.UserId).ToListAsync();
        var panelists = await _db.CompanyMembers.AsNoTracking()
            .Where(m => companyIds.Contains(m.CompanyId) && m.IsActive &&
                m.User.IsActive && ids.Contains(m.UserId))
            .Select(m => new { id = m.UserId, name = m.User.FullName, email = m.User.Email })
            .OrderBy(p => p.name).ToListAsync();
        return Ok(panelists);
    }

    [HttpGet("recruiter/interviews")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public async Task<IActionResult> RecruiterInterviews()
    {
        var rows = await InterviewsWithDetails(MyInterviews).AsNoTracking()
            .OrderByDescending(i => i.ScheduledAt).ToListAsync();
        return Ok(rows.Select(InterviewDto));
    }

    [HttpPost("recruiter/interviews")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public async Task<IActionResult> Schedule(ScheduleInterviewRequest request)
    {
        if (request.ScheduledAt <= DateTimeOffset.UtcNow ||
            string.IsNullOrWhiteSpace(request.Type) || request.Type.Trim().Length > 80 ||
            request.LocationOrLink?.Length > 500)
            return BadRequest(new { message = "Enter a future date, interview type, and valid location or link." });
        if (!IsOfficeTime(request.ScheduledAt))
            return BadRequest(new { message = $"One-hour interviews must start from 08:00 to 16:00 ({_officeTimeZone.Id})." });

        var application = await MyApplications.Include(a => a.JobPosting)
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId);
        if (application == null) return NotFound();
        if (application.Status != ApplicationStatus.Shortlisted)
            return Conflict(new { message = "Only shortlisted candidates can be interviewed." });
        if (await _db.Interviews.AnyAsync(i => i.ApplicationId == application.Id &&
            i.Status == InterviewStatus.Scheduled))
            return Conflict(new { message = "This application already has an interview." });

        var panelist = await _users.FindByIdAsync(request.PanelistId.ToString());
        if (panelist == null || !panelist.IsActive || !await _users.IsInRoleAsync(panelist, AppRoles.HiringPanelist) ||
            !await _db.CompanyMembers.AnyAsync(m => m.UserId == panelist.Id && m.IsActive &&
                m.Company.IsActive && m.CompanyId == application.JobPosting.CompanyId))
            return BadRequest(new { message = "Select an active hiring panelist from your company." });

        var scheduledAt = request.ScheduledAt.UtcDateTime;
        if (await _db.Interviews.AnyAsync(i => i.PanelistId == panelist.Id &&
            i.Status == InterviewStatus.Scheduled && i.ScheduledAt == scheduledAt))
            return Conflict(new { message = "This panelist already has an interview at that time." });

        var interview = new Interview { ApplicationId = application.Id, RecruiterId = UserId,
            PanelistId = panelist.Id, ScheduledAt = scheduledAt,
            Type = request.Type.Trim(), LocationOrLink = request.LocationOrLink?.Trim() };
        _db.Interviews.Add(interview);
        application.Status = ApplicationStatus.Interview;
        application.ShortlistRank = null;
        await _db.SaveChangesAsync();
        await CompactRanks(application.JobPostingId);
        var saved = await InterviewsWithDetails(MyInterviews).AsNoTracking().FirstAsync(i => i.Id == interview.Id);
        return Ok(InterviewDto(saved));
    }

    [HttpPut("recruiter/interviews/{id:guid}/reschedule")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public async Task<IActionResult> Reschedule(Guid id, RescheduleInterviewRequest request)
    {
        var interview = await MyInterviews.Include(i => i.Feedback).FirstOrDefaultAsync(i => i.Id == id);
        if (interview == null) return NotFound();
        if (interview.Status != InterviewStatus.Scheduled || interview.Feedback != null ||
            interview.ScheduledAt <= DateTime.UtcNow || request.ScheduledAt <= DateTimeOffset.UtcNow)
            return Conflict(new { message = "Only future interviews without feedback can be rescheduled." });
        if (!IsOfficeTime(request.ScheduledAt))
            return BadRequest(new { message = $"One-hour interviews must start from 08:00 to 16:00 ({_officeTimeZone.Id})." });
        var when = request.ScheduledAt.UtcDateTime;
        if (await _db.Interviews.AnyAsync(i => i.Id != id && i.PanelistId == interview.PanelistId &&
            i.Status == InterviewStatus.Scheduled && i.ScheduledAt == when))
            return Conflict(new { message = "This panelist already has an interview at that time." });
        interview.ScheduledAt = when;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Interview rescheduled." });
    }

    [HttpPost("recruiter/interviews/{id:guid}/cancel")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var interview = await MyInterviews.Include(i => i.Application).Include(i => i.Feedback)
            .FirstOrDefaultAsync(i => i.Id == id);
        if (interview == null) return NotFound();
        if (interview.Status != InterviewStatus.Scheduled || interview.Feedback != null ||
            interview.ScheduledAt <= DateTime.UtcNow ||
            await _db.Offers.AnyAsync(o => o.ApplicationId == interview.ApplicationId))
            return Conflict(new { message = "This interview can no longer be cancelled." });
        interview.Status = InterviewStatus.Cancelled;
        interview.Application.Status = ApplicationStatus.Shortlisted;
        interview.Application.ShortlistRank = (await MyApplications
            .Where(a => a.JobPostingId == interview.Application.JobPostingId && a.Status == ApplicationStatus.Shortlisted)
            .MaxAsync(a => (int?)a.ShortlistRank) ?? 0) + 1;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Interview cancelled; candidate returned to the shortlist." });
    }

    [HttpGet("panelist/interviews")]
    [Authorize(Roles = AppRoles.HiringPanelist)]
    public async Task<IActionResult> AssignedInterviews()
    {
        var rows = await InterviewsWithDetails(_db.Interviews.Where(i => i.PanelistId == UserId &&
            i.Application.JobPosting.CompanyId != null &&
            _db.CompanyMembers.Any(m => m.UserId == UserId && m.IsActive && m.Company.IsActive &&
                m.CompanyId == i.Application.JobPosting.CompanyId)))
            .AsNoTracking().OrderByDescending(i => i.ScheduledAt).ToListAsync();
        return Ok(rows.Select(InterviewDto));
    }

    // Only the assigned active panelist may read this candidate's interview profile.
    private IQueryable<Interview> AssignedActiveInterview(Guid id) =>
        _db.Interviews.Where(i => i.Id == id && i.PanelistId == UserId &&
            i.Status == InterviewStatus.Scheduled &&
            i.Application.Status != ApplicationStatus.Withdrawn &&
            i.Application.JobPosting.CompanyId != null &&
            i.Application.JobPosting.CompanyEntity != null &&
            i.Application.JobPosting.CompanyEntity.IsActive &&
            _db.CompanyMembers.Any(m => m.UserId == UserId && m.IsActive &&
                m.Company.IsActive && m.CompanyId == i.Application.JobPosting.CompanyId));

    [HttpGet("panelist/interviews/{id:guid}/candidate")]
    [Authorize(Roles = AppRoles.HiringPanelist)]
    public async Task<IActionResult> CandidateDetails(Guid id)
    {
        var interview = await AssignedActiveInterview(id)
            .Include(i => i.Application).ThenInclude(a => a.User)
            .Include(i => i.Application).ThenInclude(a => a.JobPosting)
            .AsNoTracking().FirstOrDefaultAsync();
        if (interview == null) return NotFound();
        var candidateId = interview.Application.UserId;
        var profile = await _db.JobSeekerProfiles.AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == candidateId);
        var skills = await _db.JobSeekerSkills.AsNoTracking()
            .Where(s => s.UserId == candidateId)
            .Select(s => new { s.Skill.Name, s.ProficiencyLevel })
            .OrderBy(s => s.Name).ToListAsync();
        var education = await _db.EducationRecords.AsNoTracking()
            .Where(e => e.UserId == candidateId).OrderByDescending(e => e.StartDate)
            .Select(e => new { e.Degree, e.Institution, e.FieldOfStudy,
                e.StartDate, e.EndDate, e.IsCurrent }).ToListAsync();
        var experience = await _db.WorkExperiences.AsNoTracking()
            .Where(e => e.UserId == candidateId).OrderByDescending(e => e.StartDate)
            .Select(e => new { e.JobTitle, e.CompanyName, e.Location,
                e.StartDate, e.EndDate, e.IsCurrent }).ToListAsync();
        var cv = await _db.JobSeekerCvs.AsNoTracking()
            .Where(c => c.UserId == candidateId)
            .Select(c => new { c.FileName }).FirstOrDefaultAsync();

        return Ok(new
        {
            interview.Id,
            JobTitle = interview.Application.JobPosting.Title,
            FullName = interview.Application.User.FullName,
            Email = interview.Application.User.Email,
            PhoneNumber = interview.Application.User.PhoneNumber,
            Headline = profile?.Headline, Location = profile?.Location, Bio = profile?.Bio,
            LinkedInUrl = profile?.LinkedInUrl, GitHubUrl = profile?.GitHubUrl,
            PortfolioUrl = profile?.PortfolioUrl,
            Skills = skills, Education = education, WorkExperience = experience,
            HasCv = cv != null, CvFileName = cv?.FileName
        });
    }

    [HttpGet("panelist/interviews/{id:guid}/cv")]
    [Authorize(Roles = AppRoles.HiringPanelist)]
    public async Task<IActionResult> DownloadCandidateCv(Guid id)
    {
        var candidateId = await AssignedActiveInterview(id).AsNoTracking()
            .Select(i => (Guid?)i.Application.UserId).FirstOrDefaultAsync();
        if (candidateId == null) return NotFound();
        var cv = await _cvs.GetFileForDownloadAsync(candidateId.Value);
        return cv == null ? NotFound(new { message = "No CV is available." }) :
            File(cv.Value.Stream, cv.Value.ContentType, cv.Value.FileName);
    }

    [HttpPut("panelist/interviews/{id:guid}/feedback")]
    [Authorize(Roles = AppRoles.HiringPanelist)]
    public async Task<IActionResult> SaveFeedback(Guid id, SaveFeedbackRequest request)
    {
        var ratings = new[] { request.TechnicalSkills, request.ProblemSolving, request.Communication, request.CultureFit };
        if (ratings.Any(x => x is < 1 or > 5) ||
            !new[] { "Strong Hire", "Hire", "Leaning No", "No Hire" }.Contains(request.Recommendation) ||
            request.Comments?.Length > 2000)
            return BadRequest(new { message = "Rate all four criteria from 1 to 5 and choose a recommendation." });
        var interview = await _db.Interviews.Include(i => i.Feedback)
            .FirstOrDefaultAsync(i => i.Id == id && i.PanelistId == UserId &&
                i.Application.JobPosting.CompanyId != null &&
                _db.CompanyMembers.Any(m => m.UserId == UserId && m.IsActive && m.Company.IsActive &&
                    m.CompanyId == i.Application.JobPosting.CompanyId));
        if (interview == null) return NotFound();
        if (interview.Status != InterviewStatus.Scheduled || interview.ScheduledAt > DateTime.UtcNow ||
            await _db.Offers.AnyAsync(o => o.ApplicationId == interview.ApplicationId &&
                o.Status != OfferStatus.Draft && o.Status != OfferStatus.Rejected))
            return Conflict(new { message = "Feedback is available after the interview and before offer approval." });
        var feedback = interview.Feedback ?? new InterviewFeedback { InterviewId = id };
        feedback.TechnicalSkills = request.TechnicalSkills;
        feedback.ProblemSolving = request.ProblemSolving;
        feedback.Communication = request.Communication;
        feedback.CultureFit = request.CultureFit;
        feedback.Recommendation = request.Recommendation;
        feedback.Comments = request.Comments?.Trim();
        feedback.SubmittedAt = DateTime.UtcNow;
        if (interview.Feedback == null) _db.InterviewFeedbacks.Add(feedback);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Feedback saved." });
    }

    [HttpGet("recruiter/offers")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public async Task<IActionResult> RecruiterOffers()
    {
        var rows = await OffersWithDetails(MyOffers).AsNoTracking()
            .OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(rows.Select(OfferDto));
    }

    [HttpPut("recruiter/offers")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public async Task<IActionResult> SaveOffer(SaveOfferRequest request)
    {
        if (request.Salary <= 0 || request.Salary > 9999999999999999m ||
            string.IsNullOrWhiteSpace(request.Currency) ||
            request.Currency.Trim().Length != 3 ||
            request.StartDate <= DateOnly.FromDateTime(DateTime.UtcNow) ||
            request.Notes?.Length > 2000)
            return BadRequest(new { message = "Enter a positive salary, three-letter currency, and future start date." });
        var application = await MyApplications.FirstOrDefaultAsync(a => a.Id == request.ApplicationId);
        if (application == null) return NotFound();
        if (application.Status != ApplicationStatus.Interview)
            return Conflict(new { message = "An interview is required before drafting an offer." });
        var interview = await _db.Interviews.Include(i => i.Feedback)
            .FirstOrDefaultAsync(i => i.ApplicationId == application.Id && i.Status == InterviewStatus.Scheduled);
        if (interview == null || interview.ScheduledAt > DateTime.UtcNow || interview.Feedback == null)
            return Conflict(new { message = "Wait for the interview and required panelist feedback." });
        var offer = await MyOffers.FirstOrDefaultAsync(o => o.ApplicationId == application.Id);
        if (offer != null && offer.Status is not (OfferStatus.Draft or OfferStatus.Rejected))
            return Conflict(new { message = "This offer cannot be edited." });
        if (offer == null) { offer = new Offer { ApplicationId = application.Id, RecruiterId = UserId }; _db.Offers.Add(offer); }
        offer.Salary = request.Salary;
        offer.Currency = request.Currency.Trim().ToUpperInvariant();
        offer.StartDate = request.StartDate;
        offer.Notes = request.Notes?.Trim();
        offer.Status = OfferStatus.Draft;
        offer.RejectionReason = null;
        offer.ReviewedByUserId = null;
        offer.ReviewedAt = null;
        offer.SubmittedAt = null;
        await _db.SaveChangesAsync();
        return Ok(new { offer.Id, status = offer.Status.ToString() });
    }

    [HttpPost("recruiter/offers/{id:guid}/submit")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public async Task<IActionResult> SubmitOffer(Guid id)
    {
        var offer = await MyOffers.Include(o => o.Application).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();
        var hasFeedback = await _db.Interviews.AnyAsync(i => i.ApplicationId == offer.ApplicationId &&
            i.Status == InterviewStatus.Scheduled && i.ScheduledAt <= DateTime.UtcNow && i.Feedback != null);
        if (offer.Status != OfferStatus.Draft || offer.Application.Status != ApplicationStatus.Interview || !hasFeedback)
            return Conflict(new { message = "A valid draft and completed interview feedback are required." });
        offer.Status = OfferStatus.Submitted;
        offer.SubmittedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Offer submitted to HR." });
    }

    [HttpPost("recruiter/offers/{id:guid}/withdraw")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public async Task<IActionResult> WithdrawOffer(Guid id)
    {
        var offer = await MyOffers.FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();
        if (offer.Status is not (OfferStatus.Draft or OfferStatus.Submitted))
            return Conflict(new { message = "Only draft or submitted offers can be withdrawn." });
        offer.Status = OfferStatus.Withdrawn;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Offer withdrawn." });
    }

    [HttpGet("hr/offers")]
    [Authorize(Roles = AppRoles.HRManager)]
    public async Task<IActionResult> HrOffers()
    {
        var rows = await OffersWithDetails(CompanyOffers.Where(o =>
            o.Status != OfferStatus.Draft && o.Status != OfferStatus.Withdrawn))
            .AsNoTracking().OrderByDescending(o => o.SubmittedAt).ToListAsync();
        return Ok(rows.Select(OfferDto));
    }

    [HttpPost("hr/offers/{id:guid}/approve")]
    [Authorize(Roles = AppRoles.HRManager)]
    public async Task<IActionResult> ApproveOffer(Guid id)
    {
        var offer = await CompanyOffers.Include(o => o.Application).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();
        if (offer.Status != OfferStatus.Submitted || offer.Application.Status != ApplicationStatus.Interview ||
            !await _db.Interviews.AnyAsync(i => i.ApplicationId == offer.ApplicationId &&
                i.Status == InterviewStatus.Scheduled && i.ScheduledAt <= DateTime.UtcNow && i.Feedback != null))
            return Conflict(new { message = "This offer cannot be approved without completed interview feedback." });
        offer.Status = OfferStatus.Approved;
        offer.ReviewedByUserId = UserId;
        offer.ReviewedAt = DateTime.UtcNow;
        offer.Application.Status = ApplicationStatus.Offer;
        _db.OfferReviews.Add(new OfferReview { OfferId = offer.Id, HrUserId = UserId,
            Decision = OfferStatus.Approved, ReviewedAt = offer.ReviewedAt.Value });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Offer approved." });
    }

    [HttpPost("hr/offers/{id:guid}/reject")]
    [Authorize(Roles = AppRoles.HRManager)]
    public async Task<IActionResult> RejectOffer(Guid id, RejectOfferRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Length > 1000)
            return BadRequest(new { message = "Give a reason of up to 1000 characters." });
        var offer = await CompanyOffers.FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();
        if (offer.Status != OfferStatus.Submitted)
            return Conflict(new { message = "Only submitted offers can be rejected." });
        offer.Status = OfferStatus.Rejected;
        offer.RejectionReason = request.Reason.Trim();
        offer.ReviewedByUserId = UserId;
        offer.ReviewedAt = DateTime.UtcNow;
        _db.OfferReviews.Add(new OfferReview { OfferId = offer.Id, HrUserId = UserId,
            Decision = OfferStatus.Rejected, Reason = offer.RejectionReason,
            ReviewedAt = offer.ReviewedAt.Value });
        await _db.SaveChangesAsync();
        return Ok(new { message = "Offer rejected." });
    }

    private async Task CompactRanks(Guid jobId)
    {
        var rows = await MyApplications.Where(a => a.JobPostingId == jobId &&
            a.Status == ApplicationStatus.Shortlisted)
            .OrderBy(a => a.ShortlistRank).ThenBy(a => a.AppliedAt).ToListAsync();
        for (var index = 0; index < rows.Count; index++) rows[index].ShortlistRank = index + 1;
        await _db.SaveChangesAsync();
    }
}
