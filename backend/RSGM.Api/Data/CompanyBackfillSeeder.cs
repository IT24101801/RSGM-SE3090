using Microsoft.EntityFrameworkCore;

namespace RSGM.Api.Data;

public static class CompanyBackfillSeeder
{
    public static async Task SeedAsync(
        IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var context = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        var postings = await context.JobPostings
            .Where(x => x.CompanyId == null)
            .ToListAsync();

        if (postings.Count == 0)
        {
            return;
        }

        var companies = await context.Companies
            .ToDictionaryAsync(
                x => x.NormalizedName,
                x => x);

        foreach (var posting in postings)
        {
            var normalized =
                posting.Company
                    .Trim()
                    .ToUpperInvariant();

            if (!companies.TryGetValue(
                    normalized,
                    out var company))
            {
                continue;
            }

            posting.CompanyId = company.Id;
        }

        await context.SaveChangesAsync();
    }
}