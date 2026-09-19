using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.JobRequisitions;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public class JobRequisitionService
{
    private readonly ApplicationDbContext _context;

    public JobRequisitionService(
        ApplicationDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // RECRUITER - GET OWN REQUISITIONS
    // =========================================================

    public async Task<List<JobRequisitionResponse>>
        GetRecruiterRequisitionsAsync(Guid recruiterId)
    {
        return await _context.JobRequisitions
            .AsNoTracking()
            .Where(x => x.RecruiterId == recruiterId)
            .Include(x => x.Company)
            .Include(x => x.Recruiter)
            .Include(x => x.ReviewedByUser)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => MapResponse(x))
            .ToListAsync();
    }

    // =========================================================
    // RECRUITER - GET SINGLE
    // =========================================================

    public async Task<JobRequisitionResponse?>
        GetRecruiterRequisitionAsync(
            Guid recruiterId,
            Guid requisitionId)
    {
        var requisition =
            await _context.JobRequisitions
                .AsNoTracking()
                .Include(x => x.Company)
                .Include(x => x.Recruiter)
                .Include(x => x.ReviewedByUser)
                .FirstOrDefaultAsync(x =>
                    x.Id == requisitionId &&
                    x.RecruiterId == recruiterId);

        return requisition == null
            ? null
            : MapResponse(requisition);
    }

    // =========================================================
    // RECRUITER - CREATE
    // =========================================================

    public async Task<JobRequisitionResponse>
        CreateAsync(
            Guid recruiterId,
            CreateJobRequisitionRequest request)
    {
        ValidateSalary(
            request.MinSalary,
            request.MaxSalary);

        var membership =
            await _context.CompanyMembers
                .AsNoTracking()
                .Include(x => x.Company)
                .FirstOrDefaultAsync(
                    x => x.UserId == recruiterId);

        if (membership == null)
        {
            throw new InvalidOperationException(
                "Recruiter must be assigned to a registered company.");
        }

        if (!membership.Company.IsActive)
        {
            throw new InvalidOperationException(
                "The assigned company is inactive.");
        }

        var requisition =
            new JobRequisition
            {
                CompanyId =
                    membership.CompanyId,

                RecruiterId =
                    recruiterId,

                PositionTitle =
                    request.PositionTitle.Trim(),

                Department =
                    request.Department.Trim(),

                Headcount =
                    request.Headcount,

                EmploymentType =
                    request.EmploymentType,

                WorkMode =
                    request.WorkMode,

                Location =
                    request.Location.Trim(),

                ExperienceLevel =
                    request.ExperienceLevel,

                MinExperienceYears =
                    request.MinExperienceYears,

                MinSalary =
                    request.MinSalary,

                MaxSalary =
                    request.MaxSalary,

                Currency =
                    string.IsNullOrWhiteSpace(
                        request.Currency)
                        ? "LKR"
                        : request.Currency
                            .Trim()
                            .ToUpperInvariant(),

                Description =
                    Clean(request.Description),

                Responsibilities =
                    Clean(request.Responsibilities),

                Requirements =
                    Clean(request.Requirements),

                Justification =
                    Clean(request.Justification),

                Status =
                    JobRequisitionStatus.Draft,

                CreatedAt =
                    DateTime.UtcNow
            };

        _context.JobRequisitions.Add(
            requisition);

        await _context.SaveChangesAsync();

        return (await GetRecruiterRequisitionAsync(
            recruiterId,
            requisition.Id))!;
    }

    // =========================================================
    // RECRUITER - UPDATE
    // =========================================================

    public async Task<JobRequisitionResponse?>
        UpdateAsync(
            Guid recruiterId,
            Guid requisitionId,
            UpdateJobRequisitionRequest request)
    {
        ValidateSalary(
            request.MinSalary,
            request.MaxSalary);

        var requisition =
            await _context.JobRequisitions
                .FirstOrDefaultAsync(x =>
                    x.Id == requisitionId &&
                    x.RecruiterId == recruiterId);

        if (requisition == null)
        {
            return null;
        }

        if (
            requisition.Status !=
                JobRequisitionStatus.Draft &&
            requisition.Status !=
                JobRequisitionStatus.Rejected)
        {
            throw new InvalidOperationException(
                "Only draft or rejected requisitions can be edited.");
        }

        requisition.PositionTitle =
            request.PositionTitle.Trim();

        requisition.Department =
            request.Department.Trim();

        requisition.Headcount =
            request.Headcount;

        requisition.EmploymentType =
            request.EmploymentType;

        requisition.WorkMode =
            request.WorkMode;

        requisition.Location =
            request.Location.Trim();

        requisition.ExperienceLevel =
            request.ExperienceLevel;

        requisition.MinExperienceYears =
            request.MinExperienceYears;

        requisition.MinSalary =
            request.MinSalary;

        requisition.MaxSalary =
            request.MaxSalary;

        requisition.Currency =
            string.IsNullOrWhiteSpace(
                request.Currency)
                ? "LKR"
                : request.Currency
                    .Trim()
                    .ToUpperInvariant();

        requisition.Description =
            Clean(request.Description);

        requisition.Responsibilities =
            Clean(request.Responsibilities);

        requisition.Requirements =
            Clean(request.Requirements);

        requisition.Justification =
            Clean(request.Justification);

        requisition.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetRecruiterRequisitionAsync(
            recruiterId,
            requisitionId);
    }

    // =========================================================
    // RECRUITER - SUBMIT / RESUBMIT
    // =========================================================

    public async Task<JobRequisitionResponse?>
        SubmitAsync(
            Guid recruiterId,
            Guid requisitionId)
    {
        var requisition =
            await _context.JobRequisitions
                .FirstOrDefaultAsync(x =>
                    x.Id == requisitionId &&
                    x.RecruiterId == recruiterId);

        if (requisition == null)
        {
            return null;
        }

        if (
            requisition.Status !=
                JobRequisitionStatus.Draft &&
            requisition.Status !=
                JobRequisitionStatus.Rejected)
        {
            throw new InvalidOperationException(
                "Only draft or rejected requisitions can be submitted.");
        }

        requisition.Status =
            JobRequisitionStatus.Submitted;

        requisition.SubmittedAt =
            DateTime.UtcNow;

        requisition.UpdatedAt =
            DateTime.UtcNow;

        // Old rejection no longer represents
        // the current submitted version.
        requisition.ReviewedByUserId =
            null;

        requisition.ReviewedAt =
            null;

        await _context.SaveChangesAsync();

        return await GetRecruiterRequisitionAsync(
            recruiterId,
            requisitionId);
    }

    // =========================================================
    // HR - GET COMPANY REQUISITIONS
    // =========================================================

    public async Task<List<JobRequisitionResponse>>
        GetHrCompanyRequisitionsAsync(
            Guid hrManagerId)
    {
        var companyId =
            await GetUserCompanyIdAsync(
                hrManagerId);

        if (companyId == null)
        {
            throw new InvalidOperationException(
                "HR Manager must be assigned to a registered company.");
        }

        return await _context.JobRequisitions
            .AsNoTracking()
            .Where(x =>
                x.CompanyId == companyId.Value)
            .Include(x => x.Company)
            .Include(x => x.Recruiter)
            .Include(x => x.ReviewedByUser)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => MapResponse(x))
            .ToListAsync();
    }

    // =========================================================
    // HR - GET SINGLE
    // =========================================================

    public async Task<JobRequisitionResponse?>
        GetHrRequisitionAsync(
            Guid hrManagerId,
            Guid requisitionId)
    {
        var companyId =
            await GetUserCompanyIdAsync(
                hrManagerId);

        if (companyId == null)
        {
            throw new InvalidOperationException(
                "HR Manager must be assigned to a registered company.");
        }

        var requisition =
            await _context.JobRequisitions
                .AsNoTracking()
                .Include(x => x.Company)
                .Include(x => x.Recruiter)
                .Include(x => x.ReviewedByUser)
                .FirstOrDefaultAsync(x =>
                    x.Id == requisitionId &&
                    x.CompanyId ==
                        companyId.Value);

        return requisition == null
            ? null
            : MapResponse(requisition);
    }

    // =========================================================
    // HR - APPROVE
    // =========================================================

    public async Task<JobRequisitionResponse?>
        ApproveAsync(
            Guid hrManagerId,
            Guid requisitionId)
    {
        var companyId =
            await GetUserCompanyIdAsync(
                hrManagerId);

        if (companyId == null)
        {
            throw new InvalidOperationException(
                "HR Manager must be assigned to a registered company.");
        }

        var requisition =
            await _context.JobRequisitions
                .FirstOrDefaultAsync(x =>
                    x.Id == requisitionId &&
                    x.CompanyId ==
                        companyId.Value);

        if (requisition == null)
        {
            return null;
        }

        if (
            requisition.Status !=
            JobRequisitionStatus.Submitted)
        {
            throw new InvalidOperationException(
                "Only submitted requisitions can be approved.");
        }

        requisition.Status =
            JobRequisitionStatus.Approved;

        requisition.HrFeedback =
            null;

        requisition.ReviewedByUserId =
            hrManagerId;

        requisition.ReviewedAt =
            DateTime.UtcNow;

        requisition.ApprovedAt =
            DateTime.UtcNow;

        requisition.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetHrRequisitionAsync(
            hrManagerId,
            requisitionId);
    }

    // =========================================================
    // HR - REJECT
    // =========================================================

    public async Task<JobRequisitionResponse?>
        RejectAsync(
            Guid hrManagerId,
            Guid requisitionId,
            RejectJobRequisitionRequest request)
    {
        var companyId =
            await GetUserCompanyIdAsync(
                hrManagerId);

        if (companyId == null)
        {
            throw new InvalidOperationException(
                "HR Manager must be assigned to a registered company.");
        }

        var requisition =
            await _context.JobRequisitions
                .FirstOrDefaultAsync(x =>
                    x.Id == requisitionId &&
                    x.CompanyId ==
                        companyId.Value);

        if (requisition == null)
        {
            return null;
        }

        if (
            requisition.Status !=
            JobRequisitionStatus.Submitted)
        {
            throw new InvalidOperationException(
                "Only submitted requisitions can be rejected.");
        }

        requisition.Status =
            JobRequisitionStatus.Rejected;

        requisition.HrFeedback =
            request.Feedback.Trim();

        requisition.ReviewedByUserId =
            hrManagerId;

        requisition.ReviewedAt =
            DateTime.UtcNow;

        requisition.ApprovedAt =
            null;

        requisition.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetHrRequisitionAsync(
            hrManagerId,
            requisitionId);
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private async Task<Guid?>
        GetUserCompanyIdAsync(
            Guid userId)
    {
        return await _context.CompanyMembers
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .Select(x =>
                (Guid?)x.CompanyId)
            .FirstOrDefaultAsync();
    }

    private static void ValidateSalary(
        decimal? minSalary,
        decimal? maxSalary)
    {
        if (
            minSalary.HasValue &&
            maxSalary.HasValue &&
            minSalary.Value >
            maxSalary.Value)
        {
            throw new InvalidOperationException(
                "Minimum salary cannot be greater than maximum salary.");
        }
    }

    private static string? Clean(
        string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static JobRequisitionResponse
        MapResponse(
            JobRequisition x)
    {
        return new JobRequisitionResponse
        {
            Id = x.Id,

            CompanyId =
                x.CompanyId,

            CompanyName =
                x.Company.Name,

            RecruiterId =
                x.RecruiterId,

            RecruiterName =
                x.Recruiter.FullName,

            PositionTitle =
                x.PositionTitle,

            Department =
                x.Department,

            Headcount =
                x.Headcount,

            EmploymentType =
                x.EmploymentType,

            WorkMode =
                x.WorkMode,

            Location =
                x.Location,

            ExperienceLevel =
                x.ExperienceLevel,

            MinExperienceYears =
                x.MinExperienceYears,

            MinSalary =
                x.MinSalary,

            MaxSalary =
                x.MaxSalary,

            Currency =
                x.Currency,

            Description =
                x.Description,

            Responsibilities =
                x.Responsibilities,

            Requirements =
                x.Requirements,

            Justification =
                x.Justification,

            Status =
                x.Status,

            HrFeedback =
                x.HrFeedback,

            ReviewedByUserId =
                x.ReviewedByUserId,

            ReviewedByName =
                x.ReviewedByUser?
                    .FullName,

            ReviewedAt =
                x.ReviewedAt,

            CreatedAt =
                x.CreatedAt,

            UpdatedAt =
                x.UpdatedAt,

            SubmittedAt =
                x.SubmittedAt,

            ApprovedAt =
                x.ApprovedAt
        };
    }
}