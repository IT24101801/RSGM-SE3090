using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Common;
using RSGM.Api.Data;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Controllers;

[ApiController]
[Authorize(Roles = AppRoles.HRManager)]
[Route("api/hr")]
public class HrAnalyticsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public HrAnalyticsController(ApplicationDbContext db) => _db = db;

    private Guid UserId => Guid.TryParse(
        User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : Guid.Empty;

    // ---------------------------------------------------------------
    // Get the company ID for the calling HR Manager.
    // ---------------------------------------------------------------
    private async Task<Guid?> GetCompanyIdAsync() =>
        await _db.CompanyMembers
            .AsNoTracking()
            .Where(m => m.UserId == UserId && m.IsActive && m.Company.IsActive)
            .Select(m => (Guid?)m.CompanyId)
            .FirstOrDefaultAsync();

    // ==============================================================
    // GET /api/hr/dashboard-summary
    // Quick action counters for the HR dashboard top cards.
    // ==============================================================
    [HttpGet("dashboard-summary")]
    public async Task<IActionResult> DashboardSummary()
    {
        var companyId = await GetCompanyIdAsync();
        if (companyId == null)
            return NotFound(new { message = "No active company is assigned to this HR Manager." });

        var pendingRequisitions = await _db.JobRequisitions
            .AsNoTracking()
            .CountAsync(r => r.CompanyId == companyId && r.Status == JobRequisitionStatus.Submitted);

        var pendingOffers = await _db.Offers
            .AsNoTracking()
            .CountAsync(o =>
                o.Application.JobPosting.CompanyId == companyId &&
                o.Status == OfferStatus.Submitted);

        // Count distinct open job postings that have at least one active application.
        var activePipelines = await _db.JobPostings
            .AsNoTracking()
            .CountAsync(j =>
                j.CompanyId == companyId &&
                j.Status == JobPostingStatus.Published &&
                j.Applications.Any(a =>
                    a.Status != ApplicationStatus.Rejected &&
                    a.Status != ApplicationStatus.Withdrawn));

        return Ok(new
        {
            pendingRequisitions,
            pendingOffers,
            activePipelines
        });
    }

    // ==============================================================
    // GET /api/hr/analytics
    // Hiring funnel and key recruitment metrics.
    // ==============================================================
    [HttpGet("analytics")]
    public async Task<IActionResult> Analytics()
    {
        var companyId = await GetCompanyIdAsync();
        if (companyId == null)
            return NotFound(new { message = "No active company is assigned to this HR Manager." });

        // ── Hiring funnel ──────────────────────────────────────────
        var applications = await _db.Applications
            .AsNoTracking()
            .Where(a => a.JobPosting.CompanyId == companyId)
            .Select(a => new { a.Status, a.AppliedAt })
            .ToListAsync();

        var totalApplications = applications.Count;
        var underReview      = applications.Count(a => a.Status == ApplicationStatus.UnderReview);
        var shortlisted      = applications.Count(a => a.Status == ApplicationStatus.Shortlisted);
        var interview        = applications.Count(a => a.Status == ApplicationStatus.Interview);
        var offered          = applications.Count(a => a.Status == ApplicationStatus.Offer);
        var hired            = applications.Count(a =>
            a.Status == ApplicationStatus.Hired);

        // ── Offer acceptance rate ──────────────────────────────────
        // Decided = Accepted (Hired) + Declined.
        var decidedOffers = await _db.Offers
            .AsNoTracking()
            .Where(o =>
                o.Application.JobPosting.CompanyId == companyId &&
                (o.Status == OfferStatus.Accepted || o.Status == OfferStatus.Declined))
            .CountAsync();

        var acceptedOffers = await _db.Offers
            .AsNoTracking()
            .Where(o =>
                o.Application.JobPosting.CompanyId == companyId &&
                o.Status == OfferStatus.Accepted)
            .CountAsync();

        double offerAcceptanceRate = decidedOffers > 0
            ? Math.Round((double)acceptedOffers / decidedOffers * 100, 1)
            : 0;

        // ── Requisition approval rate ──────────────────────────────
        var decidedRequisitions = await _db.JobRequisitions
            .AsNoTracking()
            .Where(r =>
                r.CompanyId == companyId &&
                (r.Status == JobRequisitionStatus.Approved ||
                 r.Status == JobRequisitionStatus.Rejected))
            .CountAsync();

        var approvedRequisitions = await _db.JobRequisitions
            .AsNoTracking()
            .Where(r =>
                r.CompanyId == companyId &&
                r.Status == JobRequisitionStatus.Approved)
            .CountAsync();

        double requisitionApprovalRate = decidedRequisitions > 0
            ? Math.Round((double)approvedRequisitions / decidedRequisitions * 100, 1)
            : 0;

        // ── Active candidates in pipeline ──────────────────────────
        var activeCandidates = applications.Count(a =>
            a.Status != ApplicationStatus.Rejected &&
            a.Status != ApplicationStatus.Withdrawn &&
            a.Status != ApplicationStatus.Hired &&
            a.Status != ApplicationStatus.OfferDeclined);

        // ── Average time to hire (days from application to hire) ───
        var hiredApplications = await _db.Applications
            .AsNoTracking()
            .Where(a =>
                a.JobPosting.CompanyId == companyId &&
                a.Status == ApplicationStatus.Hired)
            .Select(a => new
            {
                a.AppliedAt,
                HiredAt = _db.Offers
                    .Where(o => o.ApplicationId == a.Id && o.Status == OfferStatus.Accepted)
                    .Select(o => (DateTime?)o.RespondedAt)
                    .FirstOrDefault()
            })
            .ToListAsync();

        double avgTimeToHire = 0;
        if (hiredApplications.Count > 0)
        {
            var durations = hiredApplications
                .Where(a => a.HiredAt.HasValue)
                .Select(a => (a.HiredAt!.Value - a.AppliedAt).TotalDays)
                .ToList();

            if (durations.Count > 0)
                avgTimeToHire = Math.Round(durations.Average(), 1);
        }

        return Ok(new
        {
            funnel = new[]
            {
                new { stage = "Applications",  count = totalApplications },
                new { stage = "Under Review",   count = underReview },
                new { stage = "Shortlisted",    count = shortlisted },
                new { stage = "Interviewed",    count = interview },
                new { stage = "Offered",        count = offered },
                new { stage = "Hired",          count = hired }
            },
            offerAcceptanceRate,
            requisitionApprovalRate,
            activeCandidates,
            avgTimeToHire
        });
    }

    // ==============================================================
    // GET /api/hr/workflows
    // Active hiring pipelines with health status.
    // ==============================================================
    [HttpGet("workflows")]
    public async Task<IActionResult> Workflows()
    {
        var companyId = await GetCompanyIdAsync();
        if (companyId == null)
            return NotFound(new { message = "No active company is assigned to this HR Manager." });

        var now = DateTime.UtcNow;

        var pipelines = await _db.JobPostings
            .AsNoTracking()
            .Where(j =>
                j.CompanyId == companyId &&
                j.Status == JobPostingStatus.Published &&
                j.Applications.Any(a =>
                    a.Status != ApplicationStatus.Rejected &&
                    a.Status != ApplicationStatus.Withdrawn))
            .Select(j => new
            {
                j.Id,
                j.Title,
                j.CreatedAt,
                // Derive the current pipeline stage from the most-advanced application status.
                StageValue = j.Applications
                    .Where(a =>
                        a.Status != ApplicationStatus.Rejected &&
                        a.Status != ApplicationStatus.Withdrawn)
                    .Select(a => (int)a.Status)
                    .Max(),
                ActiveApplications = j.Applications.Count(a =>
                    a.Status != ApplicationStatus.Rejected &&
                    a.Status != ApplicationStatus.Withdrawn),
                // Check for pending HR requisition blocker.
                HasPendingRequisition = _db.JobRequisitions.Any(r =>
                    r.CompanyId == companyId &&
                    r.Status == JobRequisitionStatus.Submitted)
            })
            .ToListAsync();

        var result = pipelines.Select(j =>
        {
            var daysOpen = (int)(now - j.CreatedAt).TotalDays;

            // Map the max ApplicationStatus int to a human-readable stage name.
            var stage = j.StageValue switch
            {
                (int)ApplicationStatus.Offer      => "Offer Stage",
                (int)ApplicationStatus.Interview   => "Interviewing",
                (int)ApplicationStatus.Shortlisted => "Shortlisting",
                _                                  => "Candidate Review"
            };

            // Health: blocked if a requisition is pending, at-risk if 21-35 days, on-track otherwise.
            string health;
            if (j.HasPendingRequisition)
                health = "blocked";
            else if (daysOpen > 35)
                health = "at-risk";
            else
                health = "on-track";

            return new
            {
                j.Id,
                Name = j.Title,
                Stage = stage,
                DaysOpen = daysOpen,
                ActiveApplications = j.ActiveApplications,
                Health = health
            };
        })
        .OrderByDescending(p => p.DaysOpen)
        .ToList();

        return Ok(result);
    }
}
