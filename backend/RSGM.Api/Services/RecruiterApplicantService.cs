using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.RecruiterJobs;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public enum RecruiterReviewResult
{
    Success,
    NotFound,
    InvalidStatus,
    Locked,
    InvalidRanking
}

public class RecruiterApplicantService
{
    private readonly ApplicationDbContext _db;

    public RecruiterApplicantService(ApplicationDbContext db)
    {
        _db = db;
    }

    private IQueryable<Application> OwnedApplications(Guid recruiterId) =>
        _db.Applications.Where(a =>
            a.JobPosting.CreatedByUserId == recruiterId &&
            a.JobPosting.CompanyId != null &&
            a.JobPosting.CompanyEntity != null &&
            a.JobPosting.CompanyEntity.IsActive &&
            _db.CompanyMembers.Any(m =>
                m.UserId == recruiterId &&
                m.IsActive &&
                m.CompanyId == a.JobPosting.CompanyId));

    public async Task<List<RecruiterApplicantDto>> GetMineAsync(
        Guid recruiterId,
        Guid? jobId = null)
    {
        var query = OwnedApplications(recruiterId)
            .AsNoTracking()
            .Where(a => a.Status != ApplicationStatus.Withdrawn);

        if (jobId.HasValue)
        {
            query = query.Where(a => a.JobPostingId == jobId.Value);
        }

        var applications = await query
            .Include(a => a.User)
            .Include(a => a.JobPosting)
                .ThenInclude(j => j.RequiredSkills)
                    .ThenInclude(rs => rs.Skill)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        if (applications.Count == 0)
        {
            return new();
        }

        var userIds = applications
            .Select(a => a.UserId)
            .Distinct()
            .ToList();

        var profiles = (await _db.JobSeekerProfiles
            .AsNoTracking()
            .Where(p => userIds.Contains(p.UserId))
            .ToListAsync())
            .ToDictionary(p => p.UserId);

        var skills = (await _db.JobSeekerSkills
            .AsNoTracking()
            .Include(s => s.Skill)
            .Where(s => userIds.Contains(s.UserId))
            .ToListAsync())
            .GroupBy(s => s.UserId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var education = (await _db.EducationRecords
            .AsNoTracking()
            .Where(e => userIds.Contains(e.UserId))
            .ToListAsync())
            .GroupBy(e => e.UserId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var experience = (await _db.WorkExperiences
            .AsNoTracking()
            .Where(e => userIds.Contains(e.UserId))
            .ToListAsync())
            .GroupBy(e => e.UserId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var cvs = (await _db.JobSeekerCvs
            .AsNoTracking()
            .Where(c => userIds.Contains(c.UserId))
            .ToListAsync())
            .ToDictionary(c => c.UserId);

        return applications.Select(a =>
        {
            profiles.TryGetValue(a.UserId, out var profile);
            skills.TryGetValue(a.UserId, out var candidateSkills);
            education.TryGetValue(a.UserId, out var candidateEducation);
            experience.TryGetValue(a.UserId, out var candidateExperience);
            cvs.TryGetValue(a.UserId, out var cv);

            var names = candidateSkills?
                .Select(s => s.Skill.Name)
                .Distinct()
                .OrderBy(n => n)
                .ToList() ?? new List<string>();

            var candidateSkillIds = candidateSkills?
                .Select(s => s.SkillId)
                .ToHashSet() ?? new HashSet<Guid>();

            var required = a.JobPosting.RequiredSkills.ToList();

            var matched = required
                .Where(s => candidateSkillIds.Contains(s.SkillId))
                .Select(s => s.Skill.Name)
                .OrderBy(n => n)
                .ToList();

            var missing = required
                .Where(s => !candidateSkillIds.Contains(s.SkillId))
                .Select(s => s.Skill.Name)
                .OrderBy(n => n)
                .ToList();

            return new RecruiterApplicantDto
            {
                Id = a.Id,
                JobPostingId = a.JobPostingId,
                JobTitle = a.JobPosting.Title,
                CandidateId = a.UserId,

                FullName = a.User.FullName,
                Email = a.User.Email ?? string.Empty,
                PhoneNumber = a.User.PhoneNumber,

                Headline = profile?.Headline,
                Location = profile?.Location,
                Bio = profile?.Bio,
                LinkedInUrl = profile?.LinkedInUrl,
                GitHubUrl = profile?.GitHubUrl,
                PortfolioUrl = profile?.PortfolioUrl,

                HasCv = cv != null,
                CvFileName = cv?.FileName,

                Status = a.Status.ToString(),
                ShortlistRank = a.ShortlistRank,
                AppliedAt = a.AppliedAt,

                MatchScore = required.Count == 0
                    ? 100
                    : (int)Math.Round(
                        matched.Count * 100.0 / required.Count),

                Skills = names,
                MatchedSkills = matched,
                MissingSkills = missing,

                Education = candidateEducation?
                    .OrderByDescending(e => e.StartDate)
                    .Select(e => $"{e.Degree} — {e.Institution}")
                    .ToList() ?? new(),

                WorkExperience = candidateExperience?
                    .OrderByDescending(e => e.StartDate)
                    .Select(e => $"{e.JobTitle} — {e.CompanyName}")
                    .ToList() ?? new()
            };
        }).ToList();
    }

    public async Task<(
        RecruiterReviewResult Result,
        RecruiterApplicantDto? Applicant)> ReviewAsync(
        Guid recruiterId,
        Guid applicationId,
        string? requestedStatus)
    {
        if (!Enum.TryParse<ApplicationStatus>(
                requestedStatus,
                true,
                out var status) ||
            status is not (
                ApplicationStatus.UnderReview or
                ApplicationStatus.Shortlisted or
                ApplicationStatus.Rejected))
        {
            return (RecruiterReviewResult.InvalidStatus, null);
        }

        var application = await OwnedApplications(recruiterId)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null)
        {
            return (RecruiterReviewResult.NotFound, null);
        }

        if (application.Status is
            ApplicationStatus.Withdrawn or
            ApplicationStatus.Interview or
            ApplicationStatus.Offer)
        {
            return (RecruiterReviewResult.Locked, null);
        }

        var jobId = application.JobPostingId;
        application.Status = status;

        if (status == ApplicationStatus.Shortlisted)
        {
            if (!application.ShortlistRank.HasValue)
            {
                var currentMax = await OwnedApplications(recruiterId)
                    .Where(a =>
                        a.JobPostingId == jobId &&
                        a.Status == ApplicationStatus.Shortlisted)
                    .MaxAsync(a => (int?)a.ShortlistRank) ?? 0;

                application.ShortlistRank = currentMax + 1;
            }
        }
        else
        {
            application.ShortlistRank = null;
        }

        await _db.SaveChangesAsync();

        if (status != ApplicationStatus.Shortlisted)
        {
            await CompactRanksAsync(recruiterId, jobId);
        }

        var result = (await GetMineAsync(recruiterId, jobId))
            .FirstOrDefault(a => a.Id == applicationId);

        return (RecruiterReviewResult.Success, result);
    }

    public async Task<RecruiterReviewResult> RankAsync(
        Guid recruiterId,
        Guid jobId,
        List<Guid>? orderedIds)
    {
        var ownsJob = await _db.JobPostings.AnyAsync(j =>
            j.Id == jobId &&
            j.CreatedByUserId == recruiterId &&
            j.CompanyId != null &&
            j.CompanyEntity != null &&
            j.CompanyEntity.IsActive &&
            _db.CompanyMembers.Any(m =>
                m.UserId == recruiterId &&
                m.IsActive &&
                m.CompanyId == j.CompanyId));

        if (!ownsJob)
        {
            return RecruiterReviewResult.NotFound;
        }

        var candidates = await OwnedApplications(recruiterId)
            .Where(a =>
                a.JobPostingId == jobId &&
                a.Status == ApplicationStatus.Shortlisted)
            .ToListAsync();

        if (orderedIds == null ||
            orderedIds.Count != candidates.Count ||
            orderedIds.Distinct().Count() != candidates.Count ||
            !candidates.All(a => orderedIds.Contains(a.Id)))
        {
            return RecruiterReviewResult.InvalidRanking;
        }

        for (var i = 0; i < orderedIds.Count; i++)
        {
            candidates.First(a => a.Id == orderedIds[i])
                .ShortlistRank = i + 1;
        }

        await _db.SaveChangesAsync();

        return RecruiterReviewResult.Success;
    }

    public Task<Application?> GetOwnedApplicationAsync(
        Guid recruiterId,
        Guid applicationId) =>
        OwnedApplications(recruiterId)
            .FirstOrDefaultAsync(a =>
                a.Id == applicationId &&
                a.Status != ApplicationStatus.Withdrawn);

    private async Task CompactRanksAsync(Guid recruiterId, Guid jobId)
    {
        var candidates = await OwnedApplications(recruiterId)
            .Where(a =>
                a.JobPostingId == jobId &&
                a.Status == ApplicationStatus.Shortlisted)
            .OrderBy(a => a.ShortlistRank)
            .ThenBy(a => a.AppliedAt)
            .ToListAsync();

        for (var i = 0; i < candidates.Count; i++)
        {
            candidates[i].ShortlistRank = i + 1;
        }

        await _db.SaveChangesAsync();
    }
}