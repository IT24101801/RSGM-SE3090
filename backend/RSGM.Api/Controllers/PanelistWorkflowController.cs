using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Common;
using RSGM.Api.Data;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Controllers;

public record SendShortlistRequest(Guid PanelistId);
public record AvailabilityRequest(DateTimeOffset StartsAt);
public record PanelistScheduleRequest(Guid ApplicationId, Guid HrManagerId,
    DateTimeOffset StartsAt, string Type, string? LocationOrLink);
public record RequestNewTimeRequest(string Reason);
public record RecommendCandidateRequest(bool Selected, string Rationale);

[ApiController]
[Authorize]
[Route("api/hiring")]
public class PanelistWorkflowController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationUser> _users;
    private readonly TimeZoneInfo _zone;
    private const int SlotMinutes = 60;

    public PanelistWorkflowController(ApplicationDbContext db,
        UserManager<ApplicationUser> users, IConfiguration config)
    {
        _db = db;
        _users = users;
        _zone = TimeZoneInfo.FindSystemTimeZoneById(config["Hiring:TimeZoneId"] ?? "Asia/Colombo");
    }

    private Guid Me => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
        ? id : Guid.Empty;

    private IQueryable<ShortlistDispatch> Assigned => _db.ShortlistDispatches.Where(d =>
        d.PanelistId == Me && d.JobPosting.CompanyId != null &&
        d.JobPosting.CompanyEntity != null && d.JobPosting.CompanyEntity.IsActive &&
        _db.CompanyMembers.Any(m => m.UserId == Me && m.IsActive &&
            m.CompanyId == d.JobPosting.CompanyId));

    private static bool InHours(DateTimeOffset date, TimeZoneInfo zone)
    {
        var hour = TimeZoneInfo.ConvertTime(date, zone).TimeOfDay;
        return hour >= TimeSpan.FromHours(8) && hour + TimeSpan.FromMinutes(SlotMinutes) <= TimeSpan.FromHours(17);
    }

    private bool Allowed(DateTimeOffset date) =>
        date > DateTimeOffset.UtcNow && date <= DateTimeOffset.UtcNow.AddDays(90) &&
        InHours(date, _zone);

    private string When(DateTime utc) =>
        $"{TimeZoneInfo.ConvertTimeFromUtc(utc, _zone):ddd dd MMM yyyy, hh:mm tt} ({_zone.Id})";

    private void Notify(Guid userId, Guid interviewId, string title, string message, string link,
        NotificationKind kind = NotificationKind.InterviewScheduled) =>
        _db.UserNotifications.Add(new UserNotification {
            RecipientId = userId, InterviewId = interviewId, Kind = kind,
            Title = title, Message = message, Link = link
        });

    private async Task<bool> IsStaffInCompany(Guid userId, Guid? companyId, string role)
    {
        if (!companyId.HasValue) return false;
        var user = await _users.FindByIdAsync(userId.ToString());
        return user != null && user.IsActive && await _users.IsInRoleAsync(user, role) &&
            await _db.CompanyMembers.AnyAsync(m => m.UserId == userId && m.IsActive &&
                m.Company.IsActive && m.CompanyId == companyId.Value);
    }

    [HttpPost("recruiter/jobs/{jobId:guid}/send-shortlist")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public async Task<IActionResult> SendShortlist(Guid jobId, SendShortlistRequest request)
    {
        var job = await _db.JobPostings.FirstOrDefaultAsync(j => j.Id == jobId &&
            j.CreatedByUserId == Me && j.CompanyId != null && j.CompanyEntity != null &&
            j.CompanyEntity.IsActive && _db.CompanyMembers.Any(m => m.UserId == Me &&
                m.IsActive && m.CompanyId == j.CompanyId));
        if (job == null) return NotFound();
        if (!await IsStaffInCompany(request.PanelistId, job.CompanyId, AppRoles.HiringPanelist))
            return BadRequest(new { message = "Select an active hiring panelist in your company." });
        var shortlisted = await _db.Applications.Where(a => a.JobPostingId == jobId &&
            a.Status == ApplicationStatus.Shortlisted)
            .OrderBy(a => a.ShortlistRank).ThenBy(a => a.AppliedAt).ToListAsync();
        if (shortlisted.Count == 0) return Conflict(new { message = "Rank at least one shortlisted applicant first." });
        if (await _db.ShortlistDispatches.AnyAsync(d => d.JobPostingId == jobId))
            return Conflict(new { message = "This shortlist has already been sent." });
        var dispatch = new ShortlistDispatch { JobPostingId = jobId, RecruiterId = Me,
            PanelistId = request.PanelistId,
            Candidates = shortlisted.Select((a, i) => new ShortlistDispatchCandidate {
                ApplicationId = a.Id, Rank = i + 1 }).ToList() };
        _db.ShortlistDispatches.Add(dispatch);
        Notify(request.PanelistId, Guid.Empty, "Ranked shortlist received",
            $"A ranked shortlist for {job.Title} is ready. Open your shortlists to plan interviews.",
            "/panelist/shortlists", NotificationKind.ShortlistSubmitted);
        await _db.SaveChangesAsync();
        return Ok(new { dispatch.Id, shortlisted = shortlisted.Count, dispatch.SubmittedAt });
    }

    [HttpGet("recruiter/shortlists")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public async Task<IActionResult> SentShortlists() => Ok(await _db.ShortlistDispatches.AsNoTracking()
        .Where(d => d.RecruiterId == Me && d.JobPosting.CompanyId != null &&
            _db.CompanyMembers.Any(m => m.UserId == Me && m.IsActive && m.CompanyId == d.JobPosting.CompanyId))
        .Select(d => new { d.JobPostingId, d.PanelistId, Panelist = d.Panelist.FullName, d.SubmittedAt })
        .ToListAsync());

    [HttpGet("panelist/shortlists")]
    [Authorize(Roles = AppRoles.HiringPanelist)]
    public async Task<IActionResult> MyShortlists()
    {
        var dispatches = await Assigned.Include(d => d.JobPosting)
            .Include(d => d.Recruiter).Include(d => d.Candidates)
            .ThenInclude(c => c.Application).ThenInclude(a => a.User).AsNoTracking()
            .OrderByDescending(d => d.SubmittedAt).ToListAsync();
        return Ok(dispatches.Select(d => new {
            d.JobPostingId, JobTitle = d.JobPosting.Title, Recruiter = d.Recruiter.FullName,
            d.RecruiterId, d.SubmittedAt,
            Candidates = d.Candidates.OrderBy(c => c.Rank)
                .Where(c => c.Application.Status is ApplicationStatus.Shortlisted or ApplicationStatus.Interview or ApplicationStatus.Offer)
                .Select(c => new { c.Application.Id, Candidate = c.Application.User.FullName,
                    c.Application.User.Email, Status = c.Application.Status.ToString(), ShortlistRank = c.Rank })
        }));
    }

    [HttpGet("panelist/jobs/{jobId:guid}/hr-managers")]
    [Authorize(Roles = AppRoles.HiringPanelist)]
    public async Task<IActionResult> HrManagers(Guid jobId)
    {
        var dispatch = await Assigned.Include(d => d.JobPosting)
            .FirstOrDefaultAsync(d => d.JobPostingId == jobId);
        if (dispatch == null) return NotFound();
        var ids = await _db.UserRoles.Join(_db.Roles, ur => ur.RoleId, r => r.Id,
            (ur, r) => new { ur.UserId, r.Name })
            .Where(x => x.Name == AppRoles.HRManager).Select(x => x.UserId).ToListAsync();
        var staff = await _db.CompanyMembers.AsNoTracking().Where(m =>
            m.CompanyId == dispatch.JobPosting.CompanyId && m.IsActive && m.User.IsActive &&
            ids.Contains(m.UserId))
            .Select(m => new { id = m.UserId, name = m.User.FullName })
            .OrderBy(m => m.name).ToListAsync();
        return Ok(staff);
    }

    [HttpGet("availability")]
    [Authorize(Roles = AppRoles.Recruiter + "," + AppRoles.HiringPanelist + "," + AppRoles.HRManager)]
    public async Task<IActionResult> MyAvailability() =>
        Ok(await _db.UserAvailabilities.AsNoTracking()
            .Where(a => a.UserId == Me && a.StartsAt >= DateTime.UtcNow)
            .OrderBy(a => a.StartsAt).Select(a => new { a.Id, a.StartsAt, a.EndsAt })
            .ToListAsync());

    [HttpPost("availability")]
    [Authorize(Roles = AppRoles.Recruiter + "," + AppRoles.HiringPanelist + "," + AppRoles.HRManager)]
    public async Task<IActionResult> AddAvailability(AvailabilityRequest request)
    {
        if (!Allowed(request.StartsAt))
            return BadRequest(new { message = "Choose a one-hour slot between 08:00 and 17:00 within the next 90 days." });
        if (!await _db.CompanyMembers.AnyAsync(m => m.UserId == Me && m.IsActive && m.Company.IsActive))
            return Forbid();
        var start = request.StartsAt.UtcDateTime;
        if (await _db.UserAvailabilities.AnyAsync(a => a.UserId == Me && a.StartsAt == start))
            return Conflict(new { message = "You already added that slot." });
        var row = new UserAvailability { UserId = Me,
            StartsAt = start, EndsAt = start.AddMinutes(SlotMinutes) };
        _db.UserAvailabilities.Add(row);
        await _db.SaveChangesAsync();
        return Ok(new { row.Id, row.StartsAt, row.EndsAt });
    }

    [HttpDelete("availability/{id:guid}")]
    [Authorize(Roles = AppRoles.Recruiter + "," + AppRoles.HiringPanelist + "," + AppRoles.HRManager)]
    public async Task<IActionResult> DeleteAvailability(Guid id)
    {
        var row = await _db.UserAvailabilities.FirstOrDefaultAsync(a => a.Id == id && a.UserId == Me);
        if (row == null) return NotFound();
        if (await _db.Interviews.AnyAsync(i => i.Status != InterviewStatus.Cancelled &&
            i.ScheduledAt == row.StartsAt && (i.PanelistId == Me ||
                i.RecruiterId == Me || i.HrManagerId == Me)))
            return Conflict(new { message = "This slot has an active interview." });
        _db.UserAvailabilities.Remove(row);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<bool> SlotAvailable(Guid panelistId, Guid recruiterId, Guid hrId,
        DateTime start, Guid? excludeInterviewId = null)
    {
        var end = start.AddMinutes(SlotMinutes);
        foreach (var id in new[] { panelistId, recruiterId, hrId })
        {
            if (!await _db.UserAvailabilities.AnyAsync(a =>
                a.UserId == id && a.StartsAt <= start && a.EndsAt >= end))
                return false;
        }
        var ids = new[] { panelistId, recruiterId, hrId };
        return !await _db.Interviews.AnyAsync(i => (!excludeInterviewId.HasValue || i.Id != excludeInterviewId.Value) &&
            i.Status != InterviewStatus.Cancelled &&
            i.ScheduledAt < end && i.ScheduledAt.AddMinutes(SlotMinutes) > start &&
            (ids.Contains(i.PanelistId) || ids.Contains(i.RecruiterId) ||
                (i.HrManagerId != null && ids.Contains(i.HrManagerId.Value))));
    }

    [HttpGet("panelist/jobs/{jobId:guid}/slots")]
    [Authorize(Roles = AppRoles.HiringPanelist)]
    public async Task<IActionResult> AvailableSlots(Guid jobId, [FromQuery] Guid hrManagerId)
    {
        var dispatch = await Assigned.Include(d => d.JobPosting)
            .FirstOrDefaultAsync(d => d.JobPostingId == jobId);
        if (dispatch == null) return NotFound();
        if (!await IsStaffInCompany(hrManagerId, dispatch.JobPosting.CompanyId, AppRoles.HRManager))
            return BadRequest(new { message = "Choose an HR Manager from this company." });
        var starts = await _db.UserAvailabilities.AsNoTracking()
            .Where(a => a.UserId == Me && a.StartsAt > DateTime.UtcNow &&
                a.StartsAt < DateTime.UtcNow.AddDays(90))
            .OrderBy(a => a.StartsAt).Select(a => a.StartsAt).ToListAsync();
        var slots = new List<DateTime>();
        foreach (var start in starts.Distinct())
            if (InHours(new DateTimeOffset(start, TimeSpan.Zero), _zone) &&
                await SlotAvailable(Me, dispatch.RecruiterId, hrManagerId, start))
                slots.Add(start);
        return Ok(slots);
    }

    [HttpPost("panelist/interviews")]
    [Authorize(Roles = AppRoles.HiringPanelist)]
    public async Task<IActionResult> Propose(PanelistScheduleRequest request)
    {
        if (!Allowed(request.StartsAt) || string.IsNullOrWhiteSpace(request.Type) ||
            request.Type.Length > 80 || request.LocationOrLink?.Length > 500)
            return BadRequest(new { message = "Choose a future office-hours slot, type, and valid meeting location." });
        var application = await _db.Applications.Include(a => a.User)
            .Include(a => a.JobPosting).FirstOrDefaultAsync(a => a.Id == request.ApplicationId &&
                a.Status == ApplicationStatus.Shortlisted);
        if (application == null) return NotFound();
        var dispatch = await Assigned.FirstOrDefaultAsync(d =>
            d.JobPostingId == application.JobPostingId);
        if (dispatch == null) return Forbid();
        if (!await _db.ShortlistDispatchCandidates.AnyAsync(c => c.DispatchId == dispatch.Id && c.ApplicationId == application.Id))
            return Forbid();
        if (!await IsStaffInCompany(request.HrManagerId, application.JobPosting.CompanyId, AppRoles.HRManager))
            return BadRequest(new { message = "Select an active HR Manager from this company." });
        if (request.Type is not ("Physical" or "Online") ||
            string.IsNullOrWhiteSpace(request.LocationOrLink))
            return BadRequest(new { message = "Choose physical or online and provide a meeting location or link." });
        if (await _db.Interviews.AnyAsync(i => i.ApplicationId == application.Id &&
            i.Status != InterviewStatus.Cancelled))
            return Conflict(new { message = "This applicant already has an active interview." });
        var start = request.StartsAt.UtcDateTime;
        if (!await SlotAvailable(Me, dispatch.RecruiterId, request.HrManagerId, start))
            return Conflict(new { message = "The recruiter, panelist, and HR Manager must all be available." });
        var interview = new Interview { ApplicationId = application.Id,
            RecruiterId = dispatch.RecruiterId, PanelistId = Me,
            HrManagerId = request.HrManagerId, ScheduledAt = start,
            Type = request.Type.Trim(), LocationOrLink = request.LocationOrLink?.Trim(),
            Status = InterviewStatus.Proposed };
        _db.Interviews.Add(interview);
        application.Status = ApplicationStatus.Interview;
        application.ShortlistRank = null;
        var when = When(start);
        Notify(application.UserId, interview.Id, "Confirm your interview",
            $"An interview for {application.JobPosting.Title} is proposed for {when}. Confirm or request a different time on My Interviews. {interview.LocationOrLink}",
            "/jobs/interviews");
        Notify(dispatch.RecruiterId, interview.Id, "Interview proposed",
            $"The hiring panelist proposed an interview with {application.User.FullName} for {when}.",
            "/recruiter/interviews");
        Notify(request.HrManagerId, interview.Id, "Interview proposed",
            $"An interview for {application.JobPosting.Title} is proposed for {when}.",
            "/hr/recommendations");
        await _db.SaveChangesAsync();
        var rest = await _db.Applications.Where(a =>
            a.JobPostingId == application.JobPostingId && a.Status == ApplicationStatus.Shortlisted)
            .OrderBy(a => a.ShortlistRank).ToListAsync();
        for (var i = 0; i < rest.Count; i++) rest[i].ShortlistRank = i + 1;
        await _db.SaveChangesAsync();
        return Ok(new { interview.Id, status = interview.Status.ToString() });
    }

    [HttpGet("jobseeker/interviews")]
    [Authorize(Roles = AppRoles.JobSeeker)]
    public async Task<IActionResult> MyCandidateInterviews()
    {
        var rows = await _db.Interviews.AsNoTracking()
            .Where(i => i.Application.UserId == Me)
            .Include(i => i.Application).ThenInclude(a => a.JobPosting)
            .OrderByDescending(i => i.ScheduledAt).ToListAsync();
        return Ok(rows.Select(i => new { i.Id, Job = i.Application.JobPosting.Title,
            i.ScheduledAt, i.Type, i.LocationOrLink, Status = i.Status.ToString() }));
    }

    [HttpPost("jobseeker/interviews/{id:guid}/confirm")]
    [Authorize(Roles = AppRoles.JobSeeker)]
    public async Task<IActionResult> Confirm(Guid id)
    {
        var interview = await _db.Interviews.Include(i => i.Application)
            .FirstOrDefaultAsync(i => i.Id == id && i.Application.UserId == Me);
        if (interview == null) return NotFound();
        if (interview.Status != InterviewStatus.Proposed || interview.ScheduledAt <= DateTime.UtcNow ||
            interview.Application.Status != ApplicationStatus.Interview)
            return Conflict(new { message = "This interview cannot be confirmed." });
        interview.Status = InterviewStatus.Scheduled;
        foreach (var recipient in new[] { interview.PanelistId, interview.RecruiterId, interview.HrManagerId ?? Guid.Empty }
            .Where(x => x != Guid.Empty).Distinct())
            Notify(recipient, id, "Interview confirmed", $"The candidate confirmed the interview for {When(interview.ScheduledAt)}.",
                recipient == interview.PanelistId ? "/panelist/interviews" :
                    recipient == interview.RecruiterId ? "/recruiter/interviews" : "/hr/recommendations",
                NotificationKind.CandidateConfirmed);
        await _db.SaveChangesAsync();
        return Ok(new { status = interview.Status.ToString() });
    }

    [HttpPost("jobseeker/interviews/{id:guid}/request-new-time")]
    [Authorize(Roles = AppRoles.JobSeeker)]
    public async Task<IActionResult> RequestNewTime(Guid id, RequestNewTimeRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Length > 500)
            return BadRequest(new { message = "Provide a reason of up to 500 characters." });
        var interview = await _db.Interviews.Include(i => i.Application)
            .FirstOrDefaultAsync(i => i.Id == id && i.Application.UserId == Me);
        if (interview == null) return NotFound();
        if (interview.Status is not (InterviewStatus.Proposed or InterviewStatus.Scheduled) ||
            interview.ScheduledAt <= DateTime.UtcNow ||
            interview.Application.Status != ApplicationStatus.Interview)
            return Conflict(new { message = "This interview cannot be changed now." });
        interview.Status = InterviewStatus.RescheduleRequested;
        Notify(interview.PanelistId, id, "Candidate requested a new time",
            $"The candidate cannot attend {When(interview.ScheduledAt)}. Reason: {request.Reason.Trim()}",
            "/panelist/interviews", NotificationKind.RescheduleRequested);
        await _db.SaveChangesAsync();
        return Ok(new { status = interview.Status.ToString() });
    }

    [HttpPut("panelist/interviews/{id:guid}/new-time")]
    [Authorize(Roles = AppRoles.HiringPanelist)]
    public async Task<IActionResult> ChangeTime(Guid id, AvailabilityRequest request)
    {
        var interview = await _db.Interviews.Include(i => i.Application)
            .ThenInclude(a => a.JobPosting)
            .FirstOrDefaultAsync(i => i.Id == id && i.PanelistId == Me &&
                i.Application.Status == ApplicationStatus.Interview);
        if (interview == null) return NotFound();
        if (interview.Status is not (InterviewStatus.Proposed or InterviewStatus.Scheduled or
            InterviewStatus.RescheduleRequested) || interview.ScheduledAt <= DateTime.UtcNow ||
            !Allowed(request.StartsAt) || interview.HrManagerId == null)
            return Conflict(new { message = "Choose a future available office-hours slot." });
        var next = request.StartsAt.UtcDateTime;
        if (next == interview.ScheduledAt ||
            !await SlotAvailable(Me, interview.RecruiterId, interview.HrManagerId.Value, next, id))
            return Conflict(new { message = "That time is unavailable." });
        var old = When(interview.ScheduledAt);
        interview.ScheduledAt = next;
        interview.Status = InterviewStatus.Proposed;
        Notify(interview.Application.UserId, id, "New interview time proposed",
            $"Your interview for {interview.Application.JobPosting.Title} moved from {old} to {When(next)}. Please confirm.",
            "/jobs/interviews", NotificationKind.InterviewRescheduled);
        foreach (var recipient in new[] { interview.RecruiterId, interview.HrManagerId.Value })
            Notify(recipient, id, "Interview time changed",
                $"An interview moved from {old} to {When(next)}.",
                recipient == interview.RecruiterId ? "/recruiter/interviews" : "/hr/recommendations",
                NotificationKind.InterviewRescheduled);
        await _db.SaveChangesAsync();
        return Ok(new { status = interview.Status.ToString(), interview.ScheduledAt });
    }

    [HttpPost("panelist/interviews/{id:guid}/cancel")]
    [Authorize(Roles = AppRoles.HiringPanelist)]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var interview = await _db.Interviews.Include(i => i.Application)
            .FirstOrDefaultAsync(i => i.Id == id && i.PanelistId == Me);
        if (interview == null) return NotFound();
        if (interview.Status == InterviewStatus.Cancelled || interview.ScheduledAt <= DateTime.UtcNow ||
            await _db.InterviewFeedbacks.AnyAsync(f => f.InterviewId == id))
            return Conflict(new { message = "This interview cannot be cancelled." });
        interview.Status = InterviewStatus.Cancelled;
        interview.Application.Status = ApplicationStatus.Shortlisted;
        interview.Application.ShortlistRank = (await _db.Applications
            .Where(a => a.JobPostingId == interview.Application.JobPostingId &&
                a.Status == ApplicationStatus.Shortlisted)
            .MaxAsync(a => (int?)a.ShortlistRank) ?? 0) + 1;
        foreach (var (recipient, path) in new[] {
            (interview.Application.UserId, "/jobs/interviews"),
            (interview.RecruiterId, "/recruiter/interviews"),
            (interview.HrManagerId ?? Guid.Empty, "/hr/recommendations")
        }.Where(x => x.Item1 != Guid.Empty))
            Notify(recipient, id, "Interview cancelled",
                $"The interview scheduled for {When(interview.ScheduledAt)} has been cancelled.",
                path, NotificationKind.InterviewCancelled);
        await _db.SaveChangesAsync();
        return Ok(new { status = interview.Status.ToString() });
    }

    [HttpPost("panelist/interviews/{id:guid}/recommend")]
    [Authorize(Roles = AppRoles.HiringPanelist)]
    public async Task<IActionResult> Recommend(Guid id, RecommendCandidateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Rationale) || request.Rationale.Length > 2000)
            return BadRequest(new { message = "Explain your recommendation (up to 2000 characters)." });
        var interview = await _db.Interviews.Include(i => i.Application).ThenInclude(a => a.User)
            .Include(i => i.Application).ThenInclude(a => a.JobPosting)
            .FirstOrDefaultAsync(i => i.Id == id && i.PanelistId == Me &&
                i.Application.JobPosting.CompanyId != null &&
                _db.CompanyMembers.Any(m => m.UserId == Me && m.IsActive &&
                    m.CompanyId == i.Application.JobPosting.CompanyId));
        if (interview == null) return NotFound();
        if (interview.Status != InterviewStatus.Scheduled ||
            interview.ScheduledAt > DateTime.UtcNow || interview.HrManagerId == null ||
            interview.Application.Status != ApplicationStatus.Interview ||
            !await _db.InterviewFeedbacks.AnyAsync(f => f.InterviewId == id) ||
            await _db.CandidateRecommendations.AnyAsync(r => r.InterviewId == id))
            return Conflict(new { message = "Submit feedback after a confirmed interview before recommending." });
        _db.CandidateRecommendations.Add(new CandidateRecommendation {
            InterviewId = id, PanelistId = Me, HrManagerId = interview.HrManagerId.Value,
            Selected = request.Selected, Rationale = request.Rationale.Trim()
        });
        var message = $"{interview.Application.User.FullName} for {interview.Application.JobPosting.Title}: " +
            (request.Selected ? "Recommended" : "Not recommended") +
            $". Reason: {request.Rationale.Trim()[..Math.Min(request.Rationale.Trim().Length, 500)]}";
        Notify(interview.HrManagerId.Value, id, "Panelist recommendation received",
            message, "/hr/recommendations", NotificationKind.CandidateRecommended);
        Notify(interview.RecruiterId, id, "Panelist recommendation submitted",
            message, "/recruiter/interviews", NotificationKind.CandidateRecommended);
        await _db.SaveChangesAsync();
        return Ok(new { decision = request.Selected ? "Recommended" : "NotRecommended" });
    }

    [HttpGet("panelist/recommendations")]
    [Authorize(Roles = AppRoles.HiringPanelist)]
    public async Task<IActionResult> MyRecommendations() => Ok(await _db.CandidateRecommendations
        .AsNoTracking().Where(r => r.PanelistId == Me)
        .Select(r => new { r.InterviewId, r.Selected, r.Rationale, r.SubmittedAt })
        .ToListAsync());

    [HttpGet("recruiter/recommendations")]
    [Authorize(Roles = AppRoles.Recruiter)]
    public async Task<IActionResult> RecruiterRecommendations() => Ok(await _db.CandidateRecommendations
        .AsNoTracking().Where(r => r.Interview.RecruiterId == Me &&
            _db.CompanyMembers.Any(m => m.UserId == Me && m.IsActive &&
                m.CompanyId == r.Interview.Application.JobPosting.CompanyId))
        .Select(r => new { r.InterviewId, r.Selected, r.Rationale, r.SubmittedAt })
        .ToListAsync());

    [HttpGet("hr/recommendations")]
    [Authorize(Roles = AppRoles.HRManager)]
    public async Task<IActionResult> HrRecommendations()
    {
        var rows = await _db.CandidateRecommendations.AsNoTracking()
            .Include(r => r.Interview).ThenInclude(i => i.Application).ThenInclude(a => a.User)
            .Include(r => r.Interview).ThenInclude(i => i.Application).ThenInclude(a => a.JobPosting)
            .Include(r => r.Panelist)
            .Where(r => r.HrManagerId == Me && r.Interview.Application.JobPosting.CompanyId != null &&
                _db.CompanyMembers.Any(m => m.UserId == Me && m.IsActive &&
                    m.Company.IsActive && m.CompanyId == r.Interview.Application.JobPosting.CompanyId))
            .OrderByDescending(r => r.SubmittedAt).ToListAsync();
        return Ok(rows.Select(r => new {
            r.Id, r.InterviewId, r.Interview.ApplicationId,
            Candidate = r.Interview.Application.User.FullName,
            Job = r.Interview.Application.JobPosting.Title,
            Panelist = r.Panelist.FullName, r.Selected, r.Rationale, r.SubmittedAt
        }));
    }
}
