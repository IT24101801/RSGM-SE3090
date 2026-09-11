using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.Skills;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public class SkillService
{
    private readonly ApplicationDbContext _context;

    public SkillService(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<SkillResponse>>
        GetAllAsync()
    {
        return await _context.Skills
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new SkillResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                IsActive = x.IsActive
            })
            .ToListAsync();
    }


    public async Task<SkillResponse?>
        GetByIdAsync(Guid id)
    {
        return await _context.Skills
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new SkillResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                IsActive = x.IsActive
            })
            .FirstOrDefaultAsync();
    }


    public async Task<SkillResponse?>
        CreateAsync(CreateSkillRequest request)
    {
        var normalizedName =
            request.Name.Trim()
                .ToUpperInvariant();

        var exists =
            await _context.Skills.AnyAsync(
                x =>
                    x.NormalizedName ==
                    normalizedName);

        if (exists)
        {
            return null;
        }

        var skill = new Skill
        {
            Name = request.Name.Trim(),
            NormalizedName = normalizedName,
            Description =
                request.Description?.Trim()
        };

        _context.Skills.Add(skill);

        await _context.SaveChangesAsync();

        return new SkillResponse
        {
            Id = skill.Id,
            Name = skill.Name,
            Description = skill.Description,
            IsActive = skill.IsActive
        };
    }


    public async Task<bool> UpdateAsync(
        Guid id,
        UpdateSkillRequest request)
    {
        var skill =
            await _context.Skills
                .FindAsync(id);

        if (skill == null)
        {
            return false;
        }

        var normalizedName =
            request.Name.Trim()
                .ToUpperInvariant();

        var duplicate =
            await _context.Skills.AnyAsync(
                x =>
                    x.Id != id &&
                    x.NormalizedName ==
                    normalizedName);

        if (duplicate)
        {
            return false;
        }

        skill.Name = request.Name.Trim();
        skill.NormalizedName = normalizedName;

        skill.Description =
            request.Description?.Trim();

        skill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }


    public async Task<bool> DeactivateAsync(
        Guid id)
    {
        var skill =
            await _context.Skills
                .FindAsync(id);

        if (skill == null)
        {
            return false;
        }

        skill.IsActive = false;
        skill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }
}