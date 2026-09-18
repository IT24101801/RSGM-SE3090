using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public enum EducationOperationResult
{
    Success,
    NotFound,
    InvalidDates
}

public class JobSeekerEducationService
{
    private readonly ApplicationDbContext _context;

    public JobSeekerEducationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<EducationResponse>> GetAllAsync(Guid userId)
    {
        return await _context.EducationRecords
            .AsNoTracking()
            .Where(item => item.UserId == userId)
            .OrderByDescending(item => item.IsCurrent)
            .ThenByDescending(item => item.StartDate)
            .Select(item => new EducationResponse
            {
                Id = item.Id,
                Institution = item.Institution,
                Degree = item.Degree,
                FieldOfStudy = item.FieldOfStudy,
                StartDate = item.StartDate,
                EndDate = item.EndDate,
                IsCurrent = item.IsCurrent,
                Description = item.Description
            })
            .ToListAsync();
    }

    public async Task<EducationResponse?> GetByIdAsync(Guid userId, Guid id)
    {
        var item = await _context.EducationRecords
            .AsNoTracking()
            .FirstOrDefaultAsync(record => record.Id == id && record.UserId == userId);

        return item == null ? null : ToResponse(item);
    }

    public async Task<(EducationOperationResult Result, EducationResponse? Education)> CreateAsync(
        Guid userId,
        CreateEducationRequest request)
    {
        if (!DatesAreValid(request.StartDate, request.EndDate, request.IsCurrent))
            return (EducationOperationResult.InvalidDates, null);

        var item = new Education
        {
            UserId = userId,
            Institution = request.Institution.Trim(),
            Degree = request.Degree.Trim(),
            FieldOfStudy = Clean(request.FieldOfStudy),
            StartDate = request.StartDate!.Value,
            EndDate = request.IsCurrent ? null : request.EndDate,
            IsCurrent = request.IsCurrent,
            Description = Clean(request.Description)
        };

        _context.EducationRecords.Add(item);
        await _context.SaveChangesAsync();

        return (EducationOperationResult.Success, ToResponse(item));
    }

    public async Task<(EducationOperationResult Result, EducationResponse? Education)> UpdateAsync(
        Guid userId,
        Guid id,
        UpdateEducationRequest request)
    {
        var item = await _context.EducationRecords
            .FirstOrDefaultAsync(record => record.Id == id && record.UserId == userId);

        if (item == null)
            return (EducationOperationResult.NotFound, null);
        if (!DatesAreValid(request.StartDate, request.EndDate, request.IsCurrent))
            return (EducationOperationResult.InvalidDates, null);

        item.Institution = request.Institution.Trim();
        item.Degree = request.Degree.Trim();
        item.FieldOfStudy = Clean(request.FieldOfStudy);
        item.StartDate = request.StartDate!.Value;
        item.EndDate = request.IsCurrent ? null : request.EndDate;
        item.IsCurrent = request.IsCurrent;
        item.Description = Clean(request.Description);
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return (EducationOperationResult.Success, ToResponse(item));
    }

    public async Task<EducationOperationResult> DeleteAsync(Guid userId, Guid id)
    {
        var item = await _context.EducationRecords
            .FirstOrDefaultAsync(record => record.Id == id && record.UserId == userId);

        if (item == null)
            return EducationOperationResult.NotFound;

        _context.EducationRecords.Remove(item);
        await _context.SaveChangesAsync();
        return EducationOperationResult.Success;
    }

    private static bool DatesAreValid(DateOnly? startDate, DateOnly? endDate, bool isCurrent)
    {
        if (!startDate.HasValue) return false;
        if (isCurrent) return true;
        return endDate.HasValue && endDate.Value >= startDate.Value;
    }

    private static EducationResponse ToResponse(Education item) => new()
    {
        Id = item.Id,
        Institution = item.Institution,
        Degree = item.Degree,
        FieldOfStudy = item.FieldOfStudy,
        StartDate = item.StartDate,
        EndDate = item.EndDate,
        IsCurrent = item.IsCurrent,
        Description = item.Description
    };

    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
