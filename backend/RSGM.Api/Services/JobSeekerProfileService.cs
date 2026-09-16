using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public class JobSeekerProfileService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public JobSeekerProfileService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<ProfileResponse?> GetByUserIdAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());

        if (user == null)
        {
            return null;
        }

        var profile = await _context.JobSeekerProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId);

        return new ProfileResponse
        {
            FullName = user.FullName,
            Email = user.Email!,
            Headline = profile?.Headline,
            Location = profile?.Location,
            Bio = profile?.Bio
        };
    }

    public async Task<ProfileResponse?> UpdateAsync(
        Guid userId,
        UpdateProfileRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());

        if (user == null)
        {
            return null;
        }

        // FullName lives on the Identity user itself.
        user.FullName = request.FullName.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);

        // Headline / Location / Bio live in the extension table.
        var profile = await _context.JobSeekerProfiles
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile == null)
        {
            profile = new JobSeekerProfile
            {
                UserId = userId
            };

            _context.JobSeekerProfiles.Add(profile);
        }

        profile.Headline = request.Headline?.Trim();
        profile.Location = request.Location?.Trim();
        profile.Bio = request.Bio?.Trim();
        profile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ProfileResponse
        {
            FullName = user.FullName,
            Email = user.Email!,
            Headline = profile.Headline,
            Location = profile.Location,
            Bio = profile.Bio
        };
    }
}