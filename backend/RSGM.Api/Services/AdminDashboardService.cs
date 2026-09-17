using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.AdminDashboard;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public class AdminDashboardService
{
    private readonly ApplicationDbContext _context;

    public AdminDashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardStatsResponse> GetStatsAsync()
    {
        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

        return new AdminDashboardStatsResponse
        {
            TotalUsers = await _context.Users.AsNoTracking().CountAsync(),
            ActiveUsers = await _context.Users.AsNoTracking()
                .CountAsync(user => user.IsActive),
            InactiveUsers = await _context.Users.AsNoTracking()
                .CountAsync(user => !user.IsActive),
            NewUsersLast30Days = await _context.Users.AsNoTracking()
                .CountAsync(user => user.CreatedAt >= thirtyDaysAgo),
            TotalSkills = await _context.Skills.AsNoTracking().CountAsync(),
            ActiveSkills = await _context.Skills.AsNoTracking()
                .CountAsync(skill => skill.IsActive),
            TotalJobPostings = await _context.JobPostings.AsNoTracking().CountAsync(),
            PublishedJobPostings = await _context.JobPostings.AsNoTracking()
                .CountAsync(job => job.Status == JobPostingStatus.Published),
            TotalApplications = await _context.Applications.AsNoTracking().CountAsync()
        };
    }
}
