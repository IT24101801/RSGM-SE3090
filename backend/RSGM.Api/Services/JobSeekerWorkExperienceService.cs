using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public enum WorkExperienceOperationResult
{
    Success,
    NotFound,
    InvalidDates
}

public class JobSeekerWorkExperienceService
{
    private readonly ApplicationDbContext _context;

    public JobSeekerWorkExperienceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkExperienceResponse>> GetAllAsync(Guid userId)
    {
        return await _context.WorkExperiences
            .AsNoTracking()
            .Where(item => item.UserId == userId)
            .OrderByDescending(item => item.IsCurrent)
            .ThenByDescending(item => item.StartDate)
            .Select(item => new WorkExperienceResponse
            {
                Id = item.Id,
                JobTitle = item.JobTitle,
                CompanyName = item.CompanyName,
                Location = item.Location,
                StartDate = item.StartDate,
                EndDate = item.EndDate,
                IsCurrent = item.IsCurrent,
                Description = item.Description
            })
            .ToListAsync();
    }

    public async Task<WorkExperienceResponse?> GetByIdAsync(Guid userId, Guid id)
    {
        var item = await _context.WorkExperiences
            .AsNoTracking()
            .FirstOrDefaultAsync(record => record.Id == id && record.UserId == userId);

        return item == null ? null : ToResponse(item);
    }

    public async Task<(WorkExperienceOperationResult Result, WorkExperienceResponse? Experience)> CreateAsync(
        Guid userId,
        CreateWorkExperienceRequest request)
    {
        if (!DatesAreValid(request.StartDate, request.EndDate, request.IsCurrent))
            return (WorkExperienceOperationResult.InvalidDates, null);

        var item = new WorkExperience
        {
            UserId = userId,
            JobTitle = request.JobTitle.Trim(),
            CompanyName = request.CompanyName.Trim(),
            Location = Clean(request.Location),
            StartDate = request.StartDate!.Value,
            EndDate = request.IsCurrent ? null : request.EndDate,
            IsCurrent = request.IsCurrent,
            Description = Clean(request.Description)
        };

        _context.WorkExperiences.Add(item);
        await _context.SaveChangesAsync();

        return (WorkExperienceOperationResult.Success, ToResponse(item));
    }

    public async Task<(WorkExperienceOperationResult Result, WorkExperienceResponse? Experience)> UpdateAsync(
        Guid userId,
        Guid id,
        UpdateWorkExperienceRequest request)
    {
        var item = await _context.WorkExperiences
            .FirstOrDefaultAsync(record => record.Id == id && record.UserId == userId);

        if (item == null)
            return (WorkExperienceOperationResult.NotFound, null);
        if (!DatesAreValid(request.StartDate, request.EndDate, request.IsCurrent))
            return (WorkExperienceOperationResult.InvalidDates, null);

        item.JobTitle = request.JobTitle.Trim();
        item.CompanyName = request.CompanyName.Trim();
        item.Location = Clean(request.Location);
        item.StartDate = request.StartDate!.Value;
        item.EndDate = request.IsCurrent ? null : request.EndDate;
        item.IsCurrent = request.IsCurrent;
        item.Description = Clean(request.Description);
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return (WorkExperienceOperationResult.Success, ToResponse(item));
    }

    public async Task<WorkExperienceOperationResult> DeleteAsync(Guid userId, Guid id)
    {
        var item = await _context.WorkExperiences
            .FirstOrDefaultAsync(record => record.Id == id && record.UserId == userId);

        if (item == null)
            return WorkExperienceOperationResult.NotFound;

        _context.WorkExperiences.Remove(item);
        await _context.SaveChangesAsync();
        return WorkExperienceOperationResult.Success;
    }

    private static bool DatesAreValid(DateOnly? startDate, DateOnly? endDate, bool isCurrent)
    {
        if (!startDate.HasValue) return false;
        if (isCurrent) return true;
        return endDate.HasValue && endDate.Value >= startDate.Value;
    }

    private static WorkExperienceResponse ToResponse(WorkExperience item) => new()
    {
        Id = item.Id,
        JobTitle = item.JobTitle,
        CompanyName = item.CompanyName,
        Location = item.Location,
        StartDate = item.StartDate,
        EndDate = item.EndDate,
        IsCurrent = item.IsCurrent,
        Description = item.Description
    };

    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
