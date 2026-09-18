using Microsoft.EntityFrameworkCore;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Data;

// Temporary dev-convenience seeder. Recruiter's own create/edit workflow
// (built later) will replace the need for this — remove once that exists.
public static class JobPostingSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var context = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        // Idempotent: only seed if no postings exist yet.
        if (await context.JobPostings.AnyAsync())
        {
            return;
        }

        var skillNames = new[]
        {
            "React", "TypeScript", "JavaScript", "Tailwind CSS",
            "Node.js", "PostgreSQL", "C#", "ASP.NET Core",
            "Figma", "Design Systems", "Docker", "GraphQL"
        };

        var skillsByName = new Dictionary<string, Skill>();

        foreach (var name in skillNames)
        {
            var normalized = name.ToUpperInvariant();

            var skill = await context.Skills
                .FirstOrDefaultAsync(x => x.NormalizedName == normalized);

            if (skill == null)
            {
                skill = new Skill
                {
                    Name = name,
                    NormalizedName = normalized
                };

                context.Skills.Add(skill);
            }

            skillsByName[name] = skill;
        }

        await context.SaveChangesAsync();

        var postings = new[]
        {
            new
            {
                Title = "Senior Frontend Engineer",
                Company = "RSGM Inc.",
                Location = "Remote",
                Description = "Build and own core product surfaces using React and TypeScript.",
                Responsibilities = "Build accessible interfaces, review code, and improve frontend performance.",
                Requirements = "Strong React, TypeScript, and modern CSS experience.",
                EmploymentType = EmploymentType.FullTime,
                WorkMode = WorkMode.Remote,
                ExperienceLevel = ExperienceLevel.Senior,
                MinExperienceYears = 5,
                Skills = new[] { "React", "TypeScript", "Tailwind CSS" }
            },
            new
            {
                Title = "Backend Engineer",
                Company = "RSGM Inc.",
                Location = "Remote",
                Description = "Design and maintain our ASP.NET Core APIs and PostgreSQL data layer.",
                Responsibilities = "Develop APIs, design database queries, and maintain automated tests.",
                Requirements = "Experience with C#, ASP.NET Core, and PostgreSQL.",
                EmploymentType = EmploymentType.FullTime,
                WorkMode = WorkMode.Remote,
                ExperienceLevel = ExperienceLevel.Mid,
                MinExperienceYears = 3,
                Skills = new[] { "C#", "ASP.NET Core", "PostgreSQL" }
            },
            new
            {
                Title = "Product Designer",
                Company = "Northwind",
                Location = "Singapore",
                Description = "Own design systems and cross-platform consistency across our apps.",
                Responsibilities = "Create prototypes, maintain the design system, and conduct design reviews.",
                Requirements = "A portfolio demonstrating product design and Figma experience.",
                EmploymentType = EmploymentType.Contract,
                WorkMode = WorkMode.Hybrid,
                ExperienceLevel = ExperienceLevel.Mid,
                MinExperienceYears = 3,
                Skills = new[] { "Figma", "Design Systems" }
            },
            new
            {
                Title = "Full-Stack Developer",
                Company = "BrightPath",
                Location = "Singapore",
                Description = "Work across our React frontend and Node.js backend services.",
                Responsibilities = "Implement product features across frontend and backend services.",
                Requirements = "Knowledge of React, JavaScript, Node.js, and REST APIs.",
                EmploymentType = EmploymentType.FullTime,
                WorkMode = WorkMode.Hybrid,
                ExperienceLevel = ExperienceLevel.Junior,
                MinExperienceYears = 1,
                Skills = new[] { "React", "JavaScript", "Node.js" }
            }
        };

        foreach (var p in postings)
        {
            var posting = new JobPosting
            {
                Title = p.Title,
                Company = p.Company,
                Location = p.Location,
                Description = p.Description,
                Responsibilities = p.Responsibilities,
                Requirements = p.Requirements,
                EmploymentType = p.EmploymentType,
                WorkMode = p.WorkMode,
                ExperienceLevel = p.ExperienceLevel,
                MinExperienceYears = p.MinExperienceYears,
                MinSalary = 100000,
                MaxSalary = 180000,
                Currency = "LKR",
                ApplicationDeadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)),
                Status = JobPostingStatus.Published
            };

            foreach (var skillName in p.Skills)
            {
                posting.RequiredSkills.Add(new JobPostingSkill
                {
                    Skill = skillsByName[skillName]
                });
            }

            context.JobPostings.Add(posting);
        }

        await context.SaveChangesAsync();
    }
}
