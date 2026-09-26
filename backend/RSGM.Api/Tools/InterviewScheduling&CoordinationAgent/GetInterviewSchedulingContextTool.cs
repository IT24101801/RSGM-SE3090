using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Common;
using RSGM.Api.Data;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Tools.InterviewSchedulingCoordinationAgent;

public sealed class InterviewSchedulingContextSnapshot
{
    public Guid ApplicationId { get; init; }

    public Guid CandidateId { get; init; }

    public string CandidateName { get; init; } = string.Empty;

    public string CandidateEmail { get; init; } = string.Empty;

    public Guid JobId { get; init; }

    public string JobTitle { get; init; } = string.Empty;

    public Guid CompanyId { get; init; }

    public Guid PanelistId { get; init; }

    public string PanelistName { get; init; } = string.Empty;

    public Guid RecruiterId { get; init; }

    public string RecruiterName { get; init; } = string.Empty;

    public Guid HrManagerId { get; init; }

    public string HrManagerName { get; init; } = string.Empty;
}

public sealed class GetInterviewSchedulingContextTool
{
    private readonly ApplicationDbContext _db;

    private readonly UserManager<ApplicationUser> _users;

    private readonly InterviewSchedulingAgentToolRegistry _registry;

    public GetInterviewSchedulingContextTool(
        ApplicationDbContext db,
        UserManager<ApplicationUser> users,
        InterviewSchedulingAgentToolRegistry registry)
    {
        _db = db;
        _users = users;
        _registry = registry;
    }

    public async Task<InterviewSchedulingContextSnapshot> ExecuteAsync(
        Guid panelistId,
        Guid applicationId,
        Guid hrManagerId,
        CancellationToken cancellationToken = default)
    {
        _registry.AssertAllowed(
            InterviewSchedulingAgentRoleNames.Context,
            InterviewSchedulingAgentToolRegistry.ContextTool);

        var candidate = await _db.ShortlistDispatchCandidates
            .AsNoTracking()
            .Where(x =>
                x.ApplicationId == applicationId &&
                x.Dispatch.PanelistId == panelistId &&
                x.Application.Status == ApplicationStatus.Shortlisted &&
                x.Dispatch.JobPosting.CompanyId != null &&
                x.Dispatch.JobPosting.CompanyEntity != null &&
                x.Dispatch.JobPosting.CompanyEntity.IsActive &&
                _db.CompanyMembers.Any(member =>
                    member.UserId == panelistId &&
                    member.IsActive &&
                    member.Company.IsActive &&
                    member.CompanyId ==
                        x.Dispatch.JobPosting.CompanyId))
            .Select(x => new
            {
                ApplicationId = x.Application.Id,
                CandidateId = x.Application.UserId,
                CandidateName = x.Application.User.FullName,
                CandidateEmail = x.Application.User.Email,
                JobId = x.Dispatch.JobPostingId,
                JobTitle = x.Dispatch.JobPosting.Title,
                CompanyId = x.Dispatch.JobPosting.CompanyId!.Value,
                PanelistId = x.Dispatch.PanelistId,
                PanelistName = x.Dispatch.Panelist.FullName,
                RecruiterId = x.Dispatch.RecruiterId,
                RecruiterName = x.Dispatch.Recruiter.FullName
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (candidate == null)
        {
            throw new InvalidOperationException(
                "The selected shortlisted candidate is not available to this hiring panelist.");
        }

        var hrManager = await _users.FindByIdAsync(
            hrManagerId.ToString());

        if (hrManager == null ||
            !hrManager.IsActive ||
            !await _users.IsInRoleAsync(
                hrManager,
                AppRoles.HRManager))
        {
            throw new InvalidOperationException(
                "The selected HR Manager is invalid or inactive.");
        }

        var hrMembership =
            await _db.CompanyMembers
                .AsNoTracking()
                .AnyAsync(
                    member =>
                        member.UserId == hrManagerId &&
                        member.CompanyId == candidate.CompanyId &&
                        member.IsActive &&
                        member.Company.IsActive,
                    cancellationToken);

        if (!hrMembership)
        {
            throw new InvalidOperationException(
                "The selected HR Manager does not belong to the candidate's company.");
        }

        return new InterviewSchedulingContextSnapshot
        {
            ApplicationId = candidate.ApplicationId,
            CandidateId = candidate.CandidateId,
            CandidateName = candidate.CandidateName,
            CandidateEmail = candidate.CandidateEmail ?? string.Empty,

            JobId = candidate.JobId,
            JobTitle = candidate.JobTitle,
            CompanyId = candidate.CompanyId,

            PanelistId = candidate.PanelistId,
            PanelistName = candidate.PanelistName,

            RecruiterId = candidate.RecruiterId,
            RecruiterName = candidate.RecruiterName,

            HrManagerId = hrManager.Id,
            HrManagerName = hrManager.FullName
        };
    }
}