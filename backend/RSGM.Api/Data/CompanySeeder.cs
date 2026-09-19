using Microsoft.EntityFrameworkCore;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Data;

public static class CompanySeeder
{
    public static async Task SeedAsync(
        IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var context = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        var companies = new[]
        {
            "RSGM Inc.",
            "Northwind",
            "BrightPath"
        };

        foreach (var name in companies)
        {
            var normalized =
                name.Trim().ToUpperInvariant();

            var exists = await context.Companies
                .AnyAsync(x =>
                    x.NormalizedName == normalized);

            if (exists)
            {
                continue;
            }

            context.Companies.Add(
                new Company
                {
                    Name = name,
                    NormalizedName = normalized,
                    IsActive = true
                });
        }

        await context.SaveChangesAsync();
    }
}