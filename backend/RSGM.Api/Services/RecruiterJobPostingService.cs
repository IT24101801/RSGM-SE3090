using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.RecruiterJobs;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public enum RecruiterJobResult
{
    Success,
    NotFound,
    NoCompany,
    CompanyInactive,
    InvalidSkills,
    InvalidStatus,
    ClosedJob,
    HasApplications
}

public class RecruiterJobPostingService
{
    private readonly ApplicationDbContext _context;

    public RecruiterJobPostingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<(RecruiterJobResult Result, List<RecruiterJobPostingResponse> Jobs)>
        GetMineAsync(Guid recruiterId)
    {
        var membership = await GetMembershipAsync(recruiterId);
        if (membership == null)
            return (RecruiterJobResult.NoCompany, new List<RecruiterJobPostingResponse>());
        if (!membership.Company.IsActive)
            return (RecruiterJobResult.CompanyInactive, new List<RecruiterJobPostingResponse>());

        var jobs = await JobQuery(recruiterId)
            .OrderByDescending(job => job.CreatedAt)
            .ToListAsync();

        return (RecruiterJobResult.Success, jobs.Select(ToResponse).ToList());
    }

    public async Task<(RecruiterJobResult Result, RecruiterJobPostingResponse? Job)>
        GetMineByIdAsync(Guid recruiterId, Guid jobId)
    {
        var membership = await GetMembershipAsync(recruiterId);
        if (membership == null)
            return (RecruiterJobResult.NoCompany, null);
        if (!membership.Company.IsActive)
            return (RecruiterJobResult.CompanyInactive, null);

        var job = await JobQuery(recruiterId)
            .FirstOrDefaultAsync(item => item.Id == jobId);

        return job == null
            ? (RecruiterJobResult.NotFound, null)
            : (RecruiterJobResult.Success, ToResponse(job));
    }

    public async Task<(RecruiterJobResult Result, RecruiterJobPostingResponse? Job)>
        CreateAsync(Guid recruiterId, CreateRecruiterJobRequest request)
    {
        var membership = await GetMembershipAsync(recruiterId);
        if (membership == null)
            return (RecruiterJobResult.NoCompany, null);
        if (!membership.Company.IsActive)
            return (RecruiterJobResult.CompanyInactive, null);

        var skills = await GetValidSkillsAsync(request.SkillIds);
        if (skills == null)
            return (RecruiterJobResult.InvalidSkills, null);

        var job = new JobPosting
        {
            Title = request.Title.Trim(),
            Company = membership.Company.Name,
            CompanyId = membership.CompanyId,
            CreatedByUserId = recruiterId,
            Location = request.Location.Trim(),
            Description = Clean(request.Description),
            Status = JobPostingStatus.Draft
        };

        foreach (var skill in skills)
        {
            job.RequiredSkills.Add(new JobPostingSkill { SkillId = skill.Id });
        }

        _context.JobPostings.Add(job);
        await _context.SaveChangesAsync();

        return await GetMineByIdAsync(recruiterId, job.Id);
    }

    public async Task<(RecruiterJobResult Result, RecruiterJobPostingResponse? Job)>
        UpdateAsync(Guid recruiterId, Guid jobId, UpdateRecruiterJobRequest request)
    {
        var membership = await GetMembershipAsync(recruiterId);
        if (membership == null)
            return (RecruiterJobResult.NoCompany, null);
        if (!membership.Company.IsActive)
            return (RecruiterJobResult.CompanyInactive, null);

        var job = await _context.JobPostings
            .Include(item => item.RequiredSkills)
            .FirstOrDefaultAsync(item => item.Id == jobId && item.CreatedByUserId == recruiterId);

        if (job == null)
            return (RecruiterJobResult.NotFound, null);
        if (job.Status == JobPostingStatus.Closed)
            return (RecruiterJobResult.ClosedJob, null);

        var skills = await GetValidSkillsAsync(request.SkillIds);
        if (skills == null)
            return (RecruiterJobResult.InvalidSkills, null);

        job.Title = request.Title.Trim();
        job.Location = request.Location.Trim();
        job.Description = Clean(request.Description);
        job.UpdatedAt = DateTime.UtcNow;

        _context.JobPostingSkills.RemoveRange(job.RequiredSkills);
        job.RequiredSkills = skills
            .Select(skill => new JobPostingSkill
            {
                JobPostingId = job.Id,
                SkillId = skill.Id
            })
            .ToList();

        await _context.SaveChangesAsync();
        return await GetMineByIdAsync(recruiterId, job.Id);
    }

    public async Task<(RecruiterJobResult Result, RecruiterJobPostingResponse? Job)>
        UpdateStatusAsync(Guid recruiterId, Guid jobId, string requestedStatus)
    {
        var membership = await GetMembershipAsync(recruiterId);
        if (membership == null)
            return (RecruiterJobResult.NoCompany, null);
        if (!membership.Company.IsActive)
            return (RecruiterJobResult.CompanyInactive, null);

        var job = await _context.JobPostings
            .FirstOrDefaultAsync(item => item.Id == jobId && item.CreatedByUserId == recruiterId);

        if (job == null)
            return (RecruiterJobResult.NotFound, null);
        if (!Enum.TryParse<JobPostingStatus>(requestedStatus, true, out var status))
            return (RecruiterJobResult.InvalidStatus, null);
        if (job.Status == JobPostingStatus.Closed && status != JobPostingStatus.Closed)
            return (RecruiterJobResult.ClosedJob, null);

        job.Status = status;
        job.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetMineByIdAsync(recruiterId, job.Id);
    }

    public async Task<RecruiterJobResult> DeleteAsync(Guid recruiterId, Guid jobId)
    {
        var membership = await GetMembershipAsync(recruiterId);
        if (membership == null)
            return RecruiterJobResult.NoCompany;
        if (!membership.Company.IsActive)
            return RecruiterJobResult.CompanyInactive;

        var job = await _context.JobPostings
            .Include(item => item.Applications)
            .FirstOrDefaultAsync(item => item.Id == jobId && item.CreatedByUserId == recruiterId);

        if (job == null)
            return RecruiterJobResult.NotFound;
        if (job.Applications.Count > 0)
            return RecruiterJobResult.HasApplications;

        _context.JobPostings.Remove(job);
        await _context.SaveChangesAsync();
        return RecruiterJobResult.Success;
    }

    private Task<CompanyMember?> GetMembershipAsync(Guid recruiterId)
    {
        return _context.CompanyMembers
            .Include(member => member.Company)
            .FirstOrDefaultAsync(member =>
                member.UserId == recruiterId && member.IsActive);
    }

    private IQueryable<JobPosting> JobQuery(Guid recruiterId)
    {
        return _context.JobPostings
            .AsNoTracking()
            .Include(job => job.CompanyEntity)
            .Include(job => job.RequiredSkills)
                .ThenInclude(requiredSkill => requiredSkill.Skill)
            .Include(job => job.Applications)
            .Where(job => job.CreatedByUserId == recruiterId);
    }

    private async Task<List<Skill>?> GetValidSkillsAsync(IEnumerable<Guid> requestedIds)
    {
        var ids = requestedIds.Distinct().ToList();
        var skills = await _context.Skills
            .Where(skill => ids.Contains(skill.Id) && skill.IsActive)
            .ToListAsync();

        return skills.Count == ids.Count ? skills : null;
    }

    private static RecruiterJobPostingResponse ToResponse(JobPosting job)
    {
        return new RecruiterJobPostingResponse
        {
            Id = job.Id,
            Title = job.Title,
            Company = job.CompanyEntity?.Name ?? job.Company,
            Location = job.Location,
            Description = job.Description,
            Status = job.Status.ToString(),
            ApplicantCount = job.Applications.Count,
            CreatedAt = job.CreatedAt,
            RequiredSkills = job.RequiredSkills
                .OrderBy(item => item.Skill.Name)
                .Select(item => new RecruiterJobSkillResponse
                {
                    Id = item.SkillId,
                    Name = item.Skill.Name
                })
                .ToList()
        };
    }

    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
