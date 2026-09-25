using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.Agents;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Tools.SkillMatchingShortlisting;

/// <summary>
/// Retrieves only eligible applications belonging to the
/// recruiter's own published job.
///
/// This tool is read-only.
/// </summary>
public sealed class GetEligibleSkillMatchingCandidatesTool
    : ISkillMatchingShortlistingTool
{
    private readonly ApplicationDbContext _db;

    public GetEligibleSkillMatchingCandidatesTool(
        ApplicationDbContext db)
    {
        _db = db;
    }

    public string Name =>
        "GetEligibleSkillMatchingCandidates";

    public string Description =>
        "Retrieves eligible UnderReview applications for a recruiter-owned published job.";

    public IReadOnlySet<string> AllowedAgents =>
        new HashSet<string>(
            new[]
            {
                SkillMatchingAgentRoleNames.CandidateRetrieval
            },
            StringComparer.Ordinal);

    public async Task<object> ExecuteAsync(
        Guid recruiterId,
        JsonElement arguments,
        CancellationToken cancellationToken)
    {
        var args =
            DeserializeArguments(arguments);

        if (args.JobPostingId == Guid.Empty)
        {
            throw new ArgumentException(
                "JobPostingId is required.");
        }

        var ownsJob =
            await _db.JobPostings
                .AsNoTracking()
                .AnyAsync(
                    job =>
                        job.Id == args.JobPostingId &&
                        job.CreatedByUserId == recruiterId &&
                        job.Status == JobPostingStatus.Published &&
                        job.CompanyId != null &&
                        job.CompanyEntity != null &&
                        job.CompanyEntity.IsActive &&
                        _db.CompanyMembers.Any(
                            member =>
                                member.UserId == recruiterId &&
                                member.IsActive &&
                                member.CompanyId == job.CompanyId),
                    cancellationToken);

        if (!ownsJob)
        {
            throw new UnauthorizedAccessException(
                "The recruiter does not have access to this job posting.");
        }

        var candidates =
            await _db.Applications
                .AsNoTracking()
                .Where(
                    application =>
                        application.JobPostingId ==
                            args.JobPostingId &&
                        application.Status ==
                            ApplicationStatus.UnderReview)
                .Include(
                    application => application.User)
                .OrderBy(
                    application => application.AppliedAt)
                .Select(
                    application =>
                        new SkillMatchingCandidateInput(
                            application.Id,
                            application.UserId,
                            application.User.FullName))
                .ToListAsync(
                    cancellationToken);

        return candidates;
    }

    private static ToolArguments DeserializeArguments(
        JsonElement arguments)
    {
        if (arguments.ValueKind != JsonValueKind.Object)
        {
            throw new ArgumentException(
                "Tool arguments must be a JSON object.");
        }

        var result =
            JsonSerializer.Deserialize<ToolArguments>(
                arguments.GetRawText(),
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

        return result
            ?? throw new ArgumentException(
                "Invalid GetEligibleSkillMatchingCandidates arguments.");
    }

    private sealed class ToolArguments
    {
        public Guid JobPostingId { get; set; }
    }
}