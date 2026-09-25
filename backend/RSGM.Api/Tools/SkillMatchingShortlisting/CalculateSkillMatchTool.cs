using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.Agents;
using RSGM.Api.Services;

namespace RSGM.Api.Tools.SkillMatchingShortlisting;

/// <summary>
/// Calculates a candidate's weighted skill match using the
/// deterministic SkillMatchingEngine.
///
/// The LLM does not calculate or alter the score.
/// </summary>
public sealed class CalculateSkillMatchTool
    : ISkillMatchingShortlistingTool
{
    private readonly ApplicationDbContext _db;

    public CalculateSkillMatchTool(
        ApplicationDbContext db)
    {
        _db = db;
    }

    public string Name =>
        "CalculateSkillMatch";

    public string Description =>
        "Calculates deterministic weighted skill match using job skill weights and candidate proficiency.";

    public IReadOnlySet<string> AllowedAgents =>
        new HashSet<string>(
            new[]
            {
                SkillMatchingAgentRoleNames.Analysis
            },
            StringComparer.Ordinal);

    public async Task<object> ExecuteAsync(
        Guid recruiterId,
        JsonElement arguments,
        CancellationToken cancellationToken)
    {
        var args =
            DeserializeArguments(arguments);

        if (args.JobPostingId == Guid.Empty ||
            args.ApplicationId == Guid.Empty)
        {
            throw new ArgumentException(
                "JobPostingId and ApplicationId are required.");
        }

        var application =
            await _db.Applications
                .AsNoTracking()
                .Include(
                    item => item.User)
                .Include(
                    item => item.JobPosting)
                    .ThenInclude(
                        item => item.RequiredSkills)
                    .ThenInclude(
                        item => item.Skill)
                .FirstOrDefaultAsync(
                    item =>
                        item.Id == args.ApplicationId &&
                        item.JobPostingId == args.JobPostingId &&
                        item.JobPosting.CreatedByUserId == recruiterId &&
                        item.JobPosting.CompanyId != null &&
                        item.JobPosting.CompanyEntity != null &&
                        item.JobPosting.CompanyEntity.IsActive &&
                        _db.CompanyMembers.Any(
                            member =>
                                member.UserId == recruiterId &&
                                member.IsActive &&
                                member.CompanyId ==
                                    item.JobPosting.CompanyId),
                    cancellationToken);

        if (application == null)
        {
            throw new UnauthorizedAccessException(
                "The recruiter does not have access to this application.");
        }

        var candidateSkills =
            await _db.JobSeekerSkills
                .AsNoTracking()
                .Include(
                    item => item.Skill)
                .Where(
                    item =>
                        item.UserId == application.UserId &&
                        item.Skill.IsActive)
                .ToListAsync(
                    cancellationToken);

        var result =
            SkillMatchingEngine.Calculate(
                application.JobPosting.RequiredSkills,
                candidateSkills);

        var breakdown =
            result.Breakdown
                .Select(
                    item =>
                        new SkillMatchingBreakdownDto
                        {
                            SkillId =
                                item.SkillId,

                            SkillName =
                                item.SkillName,

                            RequiredWeight =
                                item.RequiredWeight,

                            CandidateProficiency =
                                item.CandidateProficiency,

                            ProficiencyLabel =
                                item.ProficiencyLabel,

                            ContributionPercentage =
                                item.ContributionPercentage,

                            Matched =
                                item.Matched
                        })
                .ToList();

        return new SkillMatchingToolResult(
            application.Id,
            application.UserId,
            application.User.FullName,
            result.Score,
            result.ExactScore,
            result.MatchedSkills,
            result.MissingSkills,
            result.Explanation,
            breakdown);
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
                "Invalid CalculateSkillMatch arguments.");
    }

    private sealed class ToolArguments
    {
        public Guid JobPostingId { get; set; }

        public Guid ApplicationId { get; set; }
    }
}