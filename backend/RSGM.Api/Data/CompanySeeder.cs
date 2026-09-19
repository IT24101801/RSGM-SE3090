using Microsoft.EntityFrameworkCore;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Data;

public static class CompanySeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var context = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        // =====================================================
        // 1. Seed default companies
        // =====================================================

        var defaultCompanies = new[]
        {
            "RSGM Inc.",
            "Northwind",
            "BrightPath"
        };

        foreach (var name in defaultCompanies)
        {
            var normalizedName = name
                .Trim()
                .ToUpperInvariant();

            var exists = await context.Companies
                .AnyAsync(company =>
                    company.NormalizedName == normalizedName);

            if (exists)
            {
                continue;
            }

            context.Companies.Add(
                new Company
                {
                    Name = name.Trim(),
                    NormalizedName = normalizedName,
                    IsActive = true
                });
        }

        await context.SaveChangesAsync();

        // =====================================================
        // 2. Convert old job-posting company names
        //    into real Company records
        // =====================================================

        var legacyNames = await context.JobPostings
            .Where(job =>
                job.CompanyId == null &&
                job.Company != "")
            .Select(job => job.Company)
            .Distinct()
            .ToListAsync();

        foreach (var name in legacyNames)
        {
            var trimmedName = name.Trim();

            var normalizedName = trimmedName
                .ToUpperInvariant();

            var company = await context.Companies
                .FirstOrDefaultAsync(item =>
                    item.NormalizedName == normalizedName);

            if (company == null)
            {
                company = new Company
                {
                    Name = trimmedName,
                    NormalizedName = normalizedName,
                    IsActive = true
                };

                context.Companies.Add(company);

                await context.SaveChangesAsync();
            }

            // Connect old jobs to the real Company record.
            await context.JobPostings
                .Where(job =>
                    job.CompanyId == null &&
                    job.Company == name)
                .ExecuteUpdateAsync(setters =>
                    setters.SetProperty(
                        job => job.CompanyId,
                        (Guid?)company.Id));
        }
    }
}