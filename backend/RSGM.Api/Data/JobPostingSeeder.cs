using Microsoft.EntityFrameworkCore;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Data;

public static class JobPostingSeeder
{
    public static async Task SeedAsync(
        IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var context = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        // ---------------------------------------------------------
        // 1. Load companies from the database
        // ---------------------------------------------------------
        var companies = await context.Companies
            .ToDictionaryAsync(
                x => x.NormalizedName,
                x => x);

        // ---------------------------------------------------------
        // 2. Do not seed duplicate job postings
        // ---------------------------------------------------------
        if (await context.JobPostings.AnyAsync())
        {
            return;
        }

        // ---------------------------------------------------------
        // 3. Seed skills
        // ---------------------------------------------------------
        var skillsByName = await context.Skills
            .Where(x => x.IsActive)
            .ToDictionaryAsync(
                x => x.Name,
                x => x,
                StringComparer.OrdinalIgnoreCase);

        // ---------------------------------------------------------
        // 4. Sample job postings
        // ---------------------------------------------------------
        var postings = new[]
        {
            new
            {
                Title = "Software Engineer",
                Company = "RSGM Inc.",
                Location = "Colombo",
                Description =
                    "Develop and maintain scalable software applications.",
                Skills = new[]
                {
                    "C#",
                    "ASP.NET Core",
                    "PostgreSQL"
                }
            },

            new
            {
                Title = "Machine Learning Engineer",
                Company = "Northwind",
                Location = "Colombo",
                Description =
                    "Build and deploy machine learning solutions.",
                Skills = new[]
                {
                    "Python",
                    "Machine Learning",
                    "SQL"
                }
            },

            new
            {
                Title = "Frontend Developer",
                Company = "BrightPath",
                Location = "Remote",
                Description =
                    "Develop modern and responsive web applications.",
                Skills = new[]
                {
                    "React",
                    "JavaScript",
                    "HTML"
                }
            }
        };

        // ---------------------------------------------------------
        // 5. Create job postings
        // ---------------------------------------------------------
        foreach (var p in postings)
        {
            var companyName =
                p.Company.Trim();

            var normalizedCompany =
                companyName.ToUpperInvariant();

            // Find the relational Company entity
            if (!companies.TryGetValue(
                    normalizedCompany,
                    out var company))
            {
                throw new InvalidOperationException(
                    $"Company '{companyName}' was not found.");
            }

            var posting = new JobPosting
            {
                Title = p.Title,

                // Keep the existing string field
                Company = company.Name,

                // New relational Company relationship
                CompanyId = company.Id,

                Location = p.Location,
                Description = p.Description,
                Status = JobPostingStatus.Published
            };

            // -----------------------------------------------------
            // 6. Add required skills with skill weights
            // -----------------------------------------------------
            foreach (var skillName in p.Skills)
            {
                if (!skillsByName.TryGetValue(
                        skillName,
                        out var skill))
                {
                    continue;
                }

                posting.RequiredSkills.Add(
                    new JobPostingSkill
                    {
                        Skill = skill,

                        // Default weight for now.
                        // Later Component C can use different
                        // weights for different required skills.
                        Weight = 1.0m
                    });
            }

            context.JobPostings.Add(posting);
        }

        // ---------------------------------------------------------
        // 7. Save everything
        // ---------------------------------------------------------
        await context.SaveChangesAsync();
    }
}