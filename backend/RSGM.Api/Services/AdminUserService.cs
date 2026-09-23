using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Common;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.AdminUsers;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public enum AdminUserUpdateResult
{
    Success,
    NotFound,
    InvalidRole,
    CompanyRequired,
    InvalidCompany,
    CannotModifySelf,
    LastSystemAdmin,
    Failed
}

public class AdminUserService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminUserService(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<List<AdminUserResponse>> GetAllAsync()
    {
        var users = await _userManager.Users
            .AsNoTracking()
            .OrderByDescending(user => user.CreatedAt)
            .ToListAsync();
        var responses = new List<AdminUserResponse>(users.Count);

        foreach (var user in users)
        {
            responses.Add(await ToResponseAsync(user));
        }

        return responses;
    }

    public async Task<(AdminUserUpdateResult Result, AdminUserResponse? User, IEnumerable<string> Errors)>
        UpdateStatusAsync(Guid currentAdminId, Guid userId, bool isActive)
    {
        if (currentAdminId == userId)
            return (AdminUserUpdateResult.CannotModifySelf, null, Array.Empty<string>());

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return (AdminUserUpdateResult.NotFound, null, Array.Empty<string>());

        if (!isActive && await _userManager.IsInRoleAsync(user, AppRoles.SystemAdmin) &&
            await CountActiveSystemAdminsAsync() <= 1)
        {
            return (AdminUserUpdateResult.LastSystemAdmin, null, Array.Empty<string>());
        }

        user.IsActive = isActive;
        user.UpdatedAt = DateTime.UtcNow;
        var updateResult = await _userManager.UpdateAsync(user);

        if (!updateResult.Succeeded)
        {
            return (AdminUserUpdateResult.Failed, null,
                updateResult.Errors.Select(error => error.Description).ToArray());
        }

        return (AdminUserUpdateResult.Success, await ToResponseAsync(user), Array.Empty<string>());
    }

    public async Task<(AdminUserUpdateResult Result, AdminUserResponse? User, IEnumerable<string> Errors)>
        UpdateRoleAsync(Guid currentAdminId, Guid userId, string requestedRole, Guid? companyId)
    {
        if (currentAdminId == userId)
            return (AdminUserUpdateResult.CannotModifySelf, null, Array.Empty<string>());

        var role = AppRoles.All.FirstOrDefault(item =>
            string.Equals(item, requestedRole?.Trim(), StringComparison.OrdinalIgnoreCase));
        if (role == null)
            return (AdminUserUpdateResult.InvalidRole, null, Array.Empty<string>());

        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null)
            return (AdminUserUpdateResult.NotFound, null, Array.Empty<string>());

        var usesCompany = role is AppRoles.Recruiter or AppRoles.HRManager or AppRoles.HiringPanelist;
        if (usesCompany && !companyId.HasValue)
            return (AdminUserUpdateResult.CompanyRequired, null, Array.Empty<string>());
        if (usesCompany && !await _context.Companies.AnyAsync(company =>
                company.Id == companyId!.Value && company.IsActive))
            return (AdminUserUpdateResult.InvalidCompany, null, Array.Empty<string>());

        var currentRoles = await _userManager.GetRolesAsync(user);
        if (currentRoles.Contains(AppRoles.SystemAdmin) && role != AppRoles.SystemAdmin &&
            await CountActiveSystemAdminsAsync() <= 1)
            return (AdminUserUpdateResult.LastSystemAdmin, null, Array.Empty<string>());

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            if (currentRoles.Count != 1 || !currentRoles.Contains(role))
            {
                if (currentRoles.Count > 0)
                {
                    var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
                    if (!removeResult.Succeeded)
                    {
                        await transaction.RollbackAsync();
                        return (AdminUserUpdateResult.Failed, null,
                            removeResult.Errors.Select(error => error.Description).ToArray());
                    }
                }

                var addResult = await _userManager.AddToRoleAsync(user, role);
                if (!addResult.Succeeded)
                {
                    await transaction.RollbackAsync();
                    return (AdminUserUpdateResult.Failed, null,
                        addResult.Errors.Select(error => error.Description).ToArray());
                }
            }

            var memberships = await _context.CompanyMembers
                .Where(member => member.UserId == user.Id)
                .ToListAsync();
            if (usesCompany)
            {
                var membership = memberships.FirstOrDefault();
                if (membership == null)
                {
                    _context.CompanyMembers.Add(new CompanyMember
                    {
                        CompanyId = companyId!.Value,
                        UserId = user.Id
                    });
                }
                else
                {
                    membership.CompanyId = companyId!.Value;
                    membership.IsActive = true;
                    membership.JoinedAt = DateTime.UtcNow;
                }
            }
            else
                _context.CompanyMembers.RemoveRange(memberships);

            user.UpdatedAt = DateTime.UtcNow;
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
            {
                await transaction.RollbackAsync();
                return (AdminUserUpdateResult.Failed, null,
                    updateResult.Errors.Select(error => error.Description).ToArray());
            }

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return (AdminUserUpdateResult.Success, await ToResponseAsync(user), Array.Empty<string>());
    }

    private async Task<int> CountActiveSystemAdminsAsync()
    {
        var normalizedRole = AppRoles.SystemAdmin.ToUpperInvariant();
        return await (
            from user in _context.Users
            join userRole in _context.UserRoles on user.Id equals userRole.UserId
            join role in _context.Roles on userRole.RoleId equals role.Id
            where user.IsActive && role.NormalizedName == normalizedRole
            select user.Id).Distinct().CountAsync();
    }

    private async Task<AdminUserResponse> ToResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var membership = await _context.CompanyMembers
            .AsNoTracking()
            .Where(member => member.UserId == user.Id && member.IsActive)
            .Select(member => new
            {
                member.CompanyId,
                CompanyName = member.Company.Name
            })
            .FirstOrDefaultAsync();

        return new AdminUserResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            Role = roles.FirstOrDefault() ?? "Unassigned",
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            CompanyId = membership?.CompanyId,
            CompanyName = membership?.CompanyName
        };
    }
}
