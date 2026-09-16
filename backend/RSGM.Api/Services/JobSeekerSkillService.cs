using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public enum AddSkillResult
{
    Added,
    SkillNotFound,
    AlreadyAdded
}

public class JobSeekerSkillService
{
    private readonly ApplicationDbContext _context;

    public JobSeekerSkillService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<JobSeekerSkillResponse>> GetByUserIdAsync(Guid userId)
    {
        return await _context.JobSeekerSkills
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.Skill.Name)
            .Select(x => new JobSeekerSkillResponse
            {
                SkillId = x.SkillId,
                Name = x.Skill.Name
            })
            .ToListAsync();
    }

    // Links an existing, active skill from the admin-managed taxonomy to the
    // job seeker's profile. Job seekers cannot create new skills themselves;
    // that stays a SystemAdmin-only capability (see AdminSkillsController).
    public async Task<(AddSkillResult Result, JobSeekerSkillResponse? Skill)> AddAsync(
        Guid userId,
        AddJobSeekerSkillRequest request)
    {
        var skill = await _context.Skills
            .FirstOrDefaultAsync(x => x.Id == request.SkillId && x.IsActive);

        if (skill == null)
        {
            return (AddSkillResult.SkillNotFound, null);
        }

        var alreadyLinked = await _context.JobSeekerSkills
            .AnyAsync(x => x.UserId == userId && x.SkillId == skill.Id);

        if (alreadyLinked)
        {
            return (AddSkillResult.AlreadyAdded, null);
        }

        var link = new JobSeekerSkill
        {
            UserId = userId,
            SkillId = skill.Id
        };

        _context.JobSeekerSkills.Add(link);

        await _context.SaveChangesAsync();

        return (AddSkillResult.Added, new JobSeekerSkillResponse
        {
            SkillId = skill.Id,
            Name = skill.Name
        });
    }

    public async Task<bool> RemoveAsync(Guid userId, Guid skillId)
    {
        var link = await _context.JobSeekerSkills
            .FirstOrDefaultAsync(x => x.UserId == userId && x.SkillId == skillId);

        if (link == null)
        {
            return false;
        }

        _context.JobSeekerSkills.Remove(link);

        await _context.SaveChangesAsync();

        return true;
    }
}