using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Skill> Skills => Set<Skill>();

    public DbSet<JobSeekerProfile> JobSeekerProfiles => Set<JobSeekerProfile>();

    public DbSet<JobSeekerSkill> JobSeekerSkills => Set<JobSeekerSkill>();

    public DbSet<JobSeekerCv> JobSeekerCvs => Set<JobSeekerCv>();

    public DbSet<JobPosting> JobPostings => Set<JobPosting>();

    public DbSet<JobPostingSkill> JobPostingSkills => Set<JobPostingSkill>();

    public DbSet<Application> Applications => Set<Application>();

    public DbSet<Company> Companies => Set<Company>();

    public DbSet<CompanyMember> CompanyMembers => Set<CompanyMember>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Skill>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(x => x.NormalizedName)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(x => x.Description)
                .HasMaxLength(500);

            entity.HasIndex(x => x.NormalizedName)
                .IsUnique();
        });

        builder.Entity<JobSeekerProfile>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Headline)
                .HasMaxLength(150);

            entity.Property(x => x.Location)
                .HasMaxLength(150);

            entity.Property(x => x.Bio)
                .HasMaxLength(1000);

            entity.HasIndex(x => x.UserId)
                .IsUnique();

            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<JobSeekerSkill>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => new { x.UserId, x.SkillId })
                .IsUnique();

            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Skill)
                .WithMany()
                .HasForeignKey(x => x.SkillId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<JobSeekerCv>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.FileName)
                .IsRequired()
                .HasMaxLength(260);

            entity.Property(x => x.StoredFileName)
                .IsRequired()
                .HasMaxLength(260);

            entity.Property(x => x.ContentType)
                .IsRequired()
                .HasMaxLength(150);

            entity.HasIndex(x => x.UserId)
                .IsUnique();

            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<JobPosting>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(x => x.Company)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(x => x.Location)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(x => x.Description)
                .HasMaxLength(2000);

            entity.HasIndex(x => x.CompanyId);

            entity.HasIndex(x => x.CreatedByUserId);

            entity.HasOne(x => x.CompanyEntity)
                .WithMany(x => x.JobPostings)
                .HasForeignKey(x => x.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.CreatedByUser)
                .WithMany(x => x.CreatedJobPostings)
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Company>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(x => x.Description)
                .HasMaxLength(1000);

            entity.Property(x => x.Website)
                .HasMaxLength(300);

            entity.Property(x => x.LogoUrl)
                .HasMaxLength(500);

            entity.HasIndex(x => x.Name)
                .IsUnique();
        });

        builder.Entity<CompanyMember>(entity =>
        {
            entity.HasKey(x => x.Id);

            // One staff user belongs to one company in the current system.
            entity.HasIndex(x => x.UserId)
                .IsUnique();

            entity.HasIndex(x => new { x.CompanyId, x.UserId })
                .IsUnique();

            entity.HasOne(x => x.Company)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.User)
                .WithMany(x => x.CompanyMemberships)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<JobPostingSkill>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => new { x.JobPostingId, x.SkillId })
                .IsUnique();

            entity.HasOne(x => x.JobPosting)
                .WithMany(x => x.RequiredSkills)
                .HasForeignKey(x => x.JobPostingId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Skill)
                .WithMany()
                .HasForeignKey(x => x.SkillId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Application>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => new { x.UserId, x.JobPostingId })
                .IsUnique();

            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.JobPosting)
                .WithMany(x => x.Applications)
                .HasForeignKey(x => x.JobPostingId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
