using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

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

    // Adds a skill to the job seeker's profile. If the skill name doesn't
    // already exist in the shared taxonomy, it's created (matching the
    // admin-managed Skill table used elsewhere in the app).
    public async Task<JobSeekerSkillResponse?> AddAsync(
        Guid userId,
        AddJobSeekerSkillRequest request)
    {
        var normalizedName = request.Name.Trim().ToUpperInvariant();

        var skill = await _context.Skills
            .FirstOrDefaultAsync(x => x.NormalizedName == normalizedName);

        if (skill == null)
        {
            skill = new Skill
            {
                Name = request.Name.Trim(),
                NormalizedName = normalizedName
            };

            _context.Skills.Add(skill);
        }

        var alreadyLinked = await _context.JobSeekerSkills
            .AnyAsync(x => x.UserId == userId && x.SkillId == skill.Id);

        if (alreadyLinked)
        {
            return null;
        }

        var link = new JobSeekerSkill
        {
            UserId = userId,
            SkillId = skill.Id
        };

        _context.JobSeekerSkills.Add(link);

        await _context.SaveChangesAsync();

        return new JobSeekerSkillResponse
        {
            SkillId = skill.Id,
            Name = skill.Name
        };
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