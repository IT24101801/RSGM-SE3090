using Microsoft.EntityFrameworkCore;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Data;

public static class CompanySeeder
{
    // Converts existing job-posting company names into real Company records.
    // It is safe to run every time the API starts.
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var legacyNames = await context.JobPostings
            .Where(job => job.CompanyId == null && job.Company != "")
            .Select(job => job.Company)
            .Distinct()
            .ToListAsync();

        foreach (var name in legacyNames)
        {
            var normalizedName = name.Trim().ToUpper();
            var company = await context.Companies
                .FirstOrDefaultAsync(item => item.Name.ToUpper() == normalizedName);

            if (company == null)
            {
                company = new Company { Name = name.Trim() };
                context.Companies.Add(company);
                await context.SaveChangesAsync();
            }

            await context.JobPostings
                .Where(job => job.CompanyId == null && job.Company == name)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(job => job.CompanyId, (Guid?)company.Id));
        }
    }
}
