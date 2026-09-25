using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.Agents;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Tools.SkillMatchingShortlisting;

/// <summary>
/// Performs deterministic business-rule validation of an
/// AI-generated shortlist.
///
/// This tool never changes candidate status and never
/// dispatches the shortlist.
/// </summary>
public sealed class ValidateSkillMatchingShortlistTool
    : ISkillMatchingShortlistingTool
{
    private readonly ApplicationDbContext _db;

    public ValidateSkillMatchingShortlistTool(
        ApplicationDbContext db)
    {
        _db = db;
    }

    public string Name =>
        "ValidateSkillMatchingShortlist";

    public string Description =>
        "Validates recruiter ownership, job status, approved headcount, " +
        "candidate eligibility, duplicate candidates, and previous dispatch.";

    public IReadOnlySet<string> AllowedAgents =>
        new HashSet<string>(
            new[]
            {
                SkillMatchingAgentRoleNames.ShortlistValidation
            },
            StringComparer.Ordinal);

    public async Task<object> ExecuteAsync(
        Guid recruiterId,
        JsonElement arguments,
        CancellationToken cancellationToken)
    {
        var args =
            DeserializeArguments(arguments);

        var errors =
            new List<string>();

        if (args.JobPostingId == Guid.Empty)
        {
            errors.Add(
                "A valid JobPostingId is required.");

            return new SkillMatchingValidationResult(
                false,
                errors);
        }

        var applicationIds =
            args.ApplicationIds
                .Where(
                    id => id != Guid.Empty)
                .Distinct()
                .ToList();

        if (applicationIds.Count == 0)
        {
            errors.Add(
                "At least one candidate must be proposed.");
        }

        if (errors.Count > 0)
        {
            return new SkillMatchingValidationResult(
                false,
                errors);
        }

        var job =
            await _db.JobPostings
                .AsNoTracking()
                .Include(
                    item => item.JobRequisition)
                .FirstOrDefaultAsync(
                    item =>
                        item.Id == args.JobPostingId &&
                        item.CreatedByUserId == recruiterId &&
                        item.CompanyId != null &&
                        item.CompanyEntity != null &&
                        item.CompanyEntity.IsActive &&
                        _db.CompanyMembers.Any(
                            member =>
                                member.UserId == recruiterId &&
                                member.IsActive &&
                                member.CompanyId == item.CompanyId),
                    cancellationToken);

        if (job == null)
        {
            errors.Add(
                "The job posting is not accessible to the recruiter.");

            return new SkillMatchingValidationResult(
                false,
                errors);
        }

        if (job.Status != JobPostingStatus.Published)
        {
            errors.Add(
                "The job posting must be published.");
        }

        if (job.JobRequisition == null)
        {
            errors.Add(
                "The job posting has no linked requisition.");
        }
        else if (job.JobRequisition.Status !=
                 JobRequisitionStatus.Approved)
        {
            errors.Add(
                "The linked requisition is not approved.");
        }

        if (job.JobRequisition != null &&
            applicationIds.Count >
                job.JobRequisition.Headcount)
        {
            errors.Add(
                $"The proposed shortlist contains " +
                $"{applicationIds.Count} candidate(s), " +
                $"exceeding the approved headcount of " +
                $"{job.JobRequisition.Headcount}.");
        }

        var dispatchExists =
            await _db.ShortlistDispatches
                .AsNoTracking()
                .AnyAsync(
                    dispatch =>
                        dispatch.JobPostingId ==
                            args.JobPostingId,
                    cancellationToken);

        if (dispatchExists)
        {
            errors.Add(
                "A shortlist has already been sent for this job.");
        }

        var applications =
            await _db.Applications
                .AsNoTracking()
                .Where(
                    application =>
                        applicationIds.Contains(
                            application.Id))
                .ToListAsync(
                    cancellationToken);

        var foundIds =
            applications
                .Select(
                    application =>
                        application.Id)
                .ToHashSet();

        foreach (var applicationId in applicationIds)
        {
            if (!foundIds.Contains(applicationId))
            {
                errors.Add(
                    $"Application {applicationId} was not found.");
            }
        }

        foreach (var application in applications)
        {
            if (application.JobPostingId !=
                args.JobPostingId)
            {
                errors.Add(
                    $"Application {application.Id} " +
                    "does not belong to the selected job.");
            }

            if (application.Status !=
                ApplicationStatus.UnderReview)
            {
                errors.Add(
                    $"Application {application.Id} " +
                    "is not in UnderReview status.");
            }
        }

        return new SkillMatchingValidationResult(
            errors.Count == 0,
            errors);
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
                "Invalid ValidateSkillMatchingShortlist arguments.");
    }

    private sealed class ToolArguments
    {
        public Guid JobPostingId { get; set; }

        public List<Guid> ApplicationIds { get; set; } =
            new();
    }
}