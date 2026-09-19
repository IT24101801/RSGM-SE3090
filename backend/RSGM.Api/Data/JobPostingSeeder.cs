using Microsoft.EntityFrameworkCore;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Data;

public static class JobPostingSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var context = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        // ---------------------------------------------------------
        // 1. Do not create duplicate job postings
        // ---------------------------------------------------------
        if (await context.JobPostings.AnyAsync())
        {
            return;
        }

        // ---------------------------------------------------------
        // 2. Load companies from database
        // ---------------------------------------------------------
        var companies = await context.Companies
            .ToDictionaryAsync(
                x => x.NormalizedName,
                x => x);

        // ---------------------------------------------------------
        // 3. Required skill names for sample jobs
        // ---------------------------------------------------------
        var skillNames = new[]
        {
            "React",
            "TypeScript",
            "JavaScript",
            "Tailwind CSS",
            "Node.js",
            "PostgreSQL",
            "C#",
            "ASP.NET Core",
            "Figma",
            "Design Systems",
            "Docker",
            "GraphQL"
        };

        var skillsByName =
            new Dictionary<string, Skill>(
                StringComparer.OrdinalIgnoreCase);

        // ---------------------------------------------------------
        // 4. Create missing skills
        // ---------------------------------------------------------
        foreach (var name in skillNames)
        {
            var normalizedName =
                name.Trim().ToUpperInvariant();

            var skill = await context.Skills
                .FirstOrDefaultAsync(x =>
                    x.NormalizedName == normalizedName);

            if (skill == null)
            {
                skill = new Skill
                {
                    Name = name.Trim(),
                    NormalizedName = normalizedName,
                    IsActive = true
                };

                context.Skills.Add(skill);
            }

            skillsByName[name] = skill;
        }

        await context.SaveChangesAsync();

        // ---------------------------------------------------------
        // 5. Sample job postings
        // ---------------------------------------------------------
        var postings = new[]
        {
            new
            {
                Title = "Senior Frontend Engineer",
                Company = "RSGM Inc.",
                Location = "Remote",

                Description =
                    "Build and own core product surfaces using React and TypeScript.",

                Responsibilities =
                    "Build accessible interfaces, review code, and improve frontend performance.",

                Requirements =
                    "Strong React, TypeScript, and modern CSS experience.",

                EmploymentType = EmploymentType.FullTime,
                WorkMode = WorkMode.Remote,
                ExperienceLevel = ExperienceLevel.Senior,

                MinExperienceYears = 5,

                MinSalary = 150000m,
                MaxSalary = 250000m,

                Skills = new[]
                {
                    "React",
                    "TypeScript",
                    "Tailwind CSS"
                }
            },

            new
            {
                Title = "Backend Engineer",
                Company = "RSGM Inc.",
                Location = "Remote",

                Description =
                    "Design and maintain ASP.NET Core APIs and PostgreSQL data services.",

                Responsibilities =
                    "Develop APIs, design database queries, and maintain automated tests.",

                Requirements =
                    "Experience with C#, ASP.NET Core, and PostgreSQL.",

                EmploymentType = EmploymentType.FullTime,
                WorkMode = WorkMode.Remote,
                ExperienceLevel = ExperienceLevel.Mid,

                MinExperienceYears = 3,

                MinSalary = 120000m,
                MaxSalary = 200000m,

                Skills = new[]
                {
                    "C#",
                    "ASP.NET Core",
                    "PostgreSQL"
                }
            },

            new
            {
                Title = "Product Designer",
                Company = "Northwind",
                Location = "Singapore",

                Description =
                    "Own design systems and cross-platform consistency across applications.",

                Responsibilities =
                    "Create prototypes, maintain the design system, and conduct design reviews.",

                Requirements =
                    "A portfolio demonstrating product design and Figma experience.",

                EmploymentType = EmploymentType.Contract,
                WorkMode = WorkMode.Hybrid,
                ExperienceLevel = ExperienceLevel.Mid,

                MinExperienceYears = 3,

                MinSalary = 100000m,
                MaxSalary = 180000m,

                Skills = new[]
                {
                    "Figma",
                    "Design Systems"
                }
            },

            new
            {
                Title = "Full-Stack Developer",
                Company = "BrightPath",
                Location = "Singapore",

                Description =
                    "Work across React frontend and Node.js backend services.",

                Responsibilities =
                    "Implement product features across frontend and backend services.",

                Requirements =
                    "Knowledge of React, JavaScript, Node.js, and REST APIs.",

                EmploymentType = EmploymentType.FullTime,
                WorkMode = WorkMode.Hybrid,
                ExperienceLevel = ExperienceLevel.Junior,

                MinExperienceYears = 1,

                MinSalary = 90000m,
                MaxSalary = 150000m,

                Skills = new[]
                {
                    "React",
                    "JavaScript",
                    "Node.js"
                }
            }
        };

        // ---------------------------------------------------------
        // 6. Create job postings
        // ---------------------------------------------------------
        foreach (var p in postings)
        {
            var companyName =
                p.Company.Trim();

            var normalizedCompany =
                companyName.ToUpperInvariant();

            // CompanySeeder must run before this seeder.
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

                // Existing text field
                Company = company.Name,

                // Real company relationship
                CompanyId = company.Id,

                Location = p.Location,

                Description = p.Description,

                Responsibilities = p.Responsibilities,

                Requirements = p.Requirements,

                EmploymentType = p.EmploymentType,

                WorkMode = p.WorkMode,

                ExperienceLevel = p.ExperienceLevel,

                MinExperienceYears =
                    p.MinExperienceYears,

                MinSalary =
                    p.MinSalary,

                MaxSalary =
                    p.MaxSalary,

                Currency = "LKR",

                ApplicationDeadline =
                    DateOnly.FromDateTime(
                        DateTime.UtcNow.AddDays(30)),

                Status =
                    JobPostingStatus.Published
            };

            // -----------------------------------------------------
            // 7. Add required skills
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

                        Weight = 1.0m
                    });
            }

            context.JobPostings.Add(posting);
        }

        // ---------------------------------------------------------
        // 8. Save everything
        // ---------------------------------------------------------
        await context.SaveChangesAsync();
    }
}