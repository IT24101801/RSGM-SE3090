using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public class JobSeekerDashboardService
{
    private readonly ApplicationDbContext _context;

    public JobSeekerDashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetStatsAsync(Guid userId)
    {
        var applications = await _context.Applications
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .Include(x => x.JobPosting)
                .ThenInclude(jp => jp.RequiredSkills)
                    .ThenInclude(rs => rs.Skill)
            .ToListAsync();

        var candidateSkillIds = await _context.JobSeekerSkills
            .Where(x => x.UserId == userId)
            .Select(x => x.SkillId)
            .ToListAsync();

        var candidateSkillIdSet = candidateSkillIds.ToHashSet();

        var activeApplications = applications
            .Where(a => a.Status != ApplicationStatus.Withdrawn)
            .ToList();

        var matchScores = new List<int>();
        var gapSkillCounts = new Dictionary<string, int>();

        foreach (var application in activeApplications)
        {
            var requiredSkills = application.JobPosting.RequiredSkills
                .Select(rs => rs.Skill)
                .ToList();

            if (requiredSkills.Count == 0)
            {
                continue;
            }

            var matchedCount = requiredSkills.Count(s => candidateSkillIdSet.Contains(s.Id));

            matchScores.Add((int)Math.Round(matchedCount * 100.0 / requiredSkills.Count));

            foreach (var gap in requiredSkills.Where(s => !candidateSkillIdSet.Contains(s.Id)))
            {
                gapSkillCounts[gap.Name] = gapSkillCounts.GetValueOrDefault(gap.Name) + 1;
            }
        }

        var profile = await _context.JobSeekerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId);

        var cv = await _context.JobSeekerCvs
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId);

        var completenessChecks = 0;
        if (!string.IsNullOrWhiteSpace(profile?.Headline)) completenessChecks++;
        if (!string.IsNullOrWhiteSpace(profile?.Location)) completenessChecks++;
        if (!string.IsNullOrWhiteSpace(profile?.Bio)) completenessChecks++;
        if (candidateSkillIdSet.Count > 0) completenessChecks++;
        if (cv != null) completenessChecks++;

        return new DashboardStatsDto
        {
            TotalApplications = applications.Count,
            ActiveApplications = activeApplications.Count,
            WithdrawnApplications = applications.Count - activeApplications.Count,
            AverageMatchScore = matchScores.Count == 0
                ? 0
                : Math.Round(matchScores.Average(), 1),
            SkillsCount = candidateSkillIdSet.Count,
            CvUploaded = cv != null,
            ProfileCompleteness = completenessChecks * 20,
            TopGapSkills = gapSkillCounts
                .OrderByDescending(kv => kv.Value)
                .ThenBy(kv => kv.Key)
                .Take(5)
                .Select(kv => kv.Key)
                .ToList()
        };
    }
}
