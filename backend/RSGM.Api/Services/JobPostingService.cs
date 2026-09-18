using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.Jobs;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public class JobPostingService
{
    private readonly ApplicationDbContext _context;

    public JobPostingService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Only Published postings are visible here — Draft/Closed stay hidden
    // from JobSeekers. Recruiter's own management view (later) will show all.
    public async Task<List<JobPostingResponse>> GetPublishedAsync()
    {
        var postings = await _context.JobPostings
            .AsNoTracking()
            .Where(x => x.Status == JobPostingStatus.Published)
            .Include(x => x.CompanyEntity)
            .Include(x => x.RequiredSkills)
                .ThenInclude(rs => rs.Skill)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return postings.Select(ToResponse).ToList();
    }

    public async Task<JobPostingResponse?> GetPublishedByIdAsync(Guid id)
    {
        var posting = await _context.JobPostings
            .AsNoTracking()
            .Include(x => x.CompanyEntity)
            .Include(x => x.RequiredSkills)
                .ThenInclude(rs => rs.Skill)
            .FirstOrDefaultAsync(x => x.Id == id && x.Status == JobPostingStatus.Published);

        return posting == null ? null : ToResponse(posting);
    }

    private static JobPostingResponse ToResponse(JobPosting posting)
    {
        return new JobPostingResponse
        {
            Id = posting.Id,
            Title = posting.Title,
            Company = posting.CompanyEntity?.Name ?? posting.Company,
            Location = posting.Location,
            Description = posting.Description,
            RequiredSkills = posting.RequiredSkills
                .Select(rs => rs.Skill.Name)
                .OrderBy(name => name)
                .ToList()
        };
    }
}
