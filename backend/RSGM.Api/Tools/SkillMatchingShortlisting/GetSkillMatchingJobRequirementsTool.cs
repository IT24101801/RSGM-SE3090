using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.Agents;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Tools.SkillMatchingShortlisting;

/// <summary>
/// Retrieves the approved requirements of a recruiter-owned,
/// published job posting.
///
/// This tool is read-only.
/// It does not modify recruitment state.
/// </summary>
public sealed class GetSkillMatchingJobRequirementsTool
    : ISkillMatchingShortlistingTool
{
    private readonly ApplicationDbContext _db;

    public GetSkillMatchingJobRequirementsTool(
        ApplicationDbContext db)
    {
        _db = db;
    }

    public string Name =>
        "GetSkillMatchingJobRequirements";

    public string Description =>
        "Retrieves the published job title, approved headcount, " +
        "and active weighted required skills.";

    public IReadOnlySet<string> AllowedAgents =>
        new HashSet<string>(
            new[]
            {
                SkillMatchingAgentRoleNames.JobRequirements
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

        var job =
            await _db.JobPostings
                .AsNoTracking()
                .Include(item => item.RequiredSkills)
                    .ThenInclude(item => item.Skill)
                .Include(item => item.JobRequisition)
                .FirstOrDefaultAsync(
                    item =>
                        item.Id == args.JobPostingId &&
                        item.Status == JobPostingStatus.Published,
                    cancellationToken);

        if (job == null)
        {
            throw new InvalidOperationException(
                "The requested job posting is not published.");
        }

        if (job.JobRequisition == null ||
            job.JobRequisition.Status !=
                JobRequisitionStatus.Approved)
        {
            throw new InvalidOperationException(
                "The job does not have an approved requisition.");
        }

        var requiredSkills =
            job.RequiredSkills
                .Where(
                    item =>
                        item.Skill != null &&
                        item.Skill.IsActive &&
                        item.Weight > 0)
                .OrderByDescending(
                    item => item.Weight)
                .ThenBy(
                    item => item.Skill.Name)
                .Select(
                    item =>
                        new SkillMatchingRequiredSkill(
                            item.SkillId,
                            item.Skill.Name,
                            item.Weight))
                .ToList();

        if (requiredSkills.Count == 0)
        {
            throw new InvalidOperationException(
                "The published job does not contain valid required skills.");
        }

        var totalWeight =
            requiredSkills.Sum(
                item => item.Weight);

        if (totalWeight <= 0)
        {
            throw new InvalidOperationException(
                "The job contains invalid total skill weight.");
        }

        var objective =
            string.IsNullOrWhiteSpace(args.Objective)
                ? $"Identify and rank suitable candidates for {job.Title}."
                : args.Objective.Trim();

        return new SkillMatchingJobRequirements(
            job.Id,
            job.Title,
            job.JobRequisition.Headcount,
            objective,
            requiredSkills);
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
                "Invalid GetSkillMatchingJobRequirements arguments.");
    }

    private sealed class ToolArguments
    {
        public Guid JobPostingId { get; set; }

        public string? Objective { get; set; }
    }
}