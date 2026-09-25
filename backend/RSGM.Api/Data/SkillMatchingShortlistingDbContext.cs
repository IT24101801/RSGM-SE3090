using Microsoft.EntityFrameworkCore;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Data;

/// <summary>
/// Dedicated persistence context for the Recruiter-owned
/// Skill Matching & Shortlisting Agent.
///
/// This context intentionally does NOT include the main RSGM
/// business entities such as JobPosting, Application or Company.
/// Those continue to use ApplicationDbContext.
///
/// Keeping the Agent workflow state isolated reduces merge
/// conflicts between team members' Agents.
/// </summary>
public sealed class SkillMatchingShortlistingDbContext
    : DbContext
{
    public SkillMatchingShortlistingDbContext(
        DbContextOptions<SkillMatchingShortlistingDbContext> options)
        : base(options)
    {
    }

    public DbSet<SkillMatchingShortlistingWorkflow> Workflows
        => Set<SkillMatchingShortlistingWorkflow>();

    public DbSet<SkillMatchingShortlistingWorkflowStep> WorkflowSteps
        => Set<SkillMatchingShortlistingWorkflowStep>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =====================================================
        // Skill Matching Agent Workflow
        // =====================================================

        modelBuilder.Entity<SkillMatchingShortlistingWorkflow>(
            entity =>
            {
                entity.ToTable(
                    "SkillMatchingAgentWorkflows");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Objective)
                    .IsRequired()
                    .HasMaxLength(1000);

                entity.Property(x => x.Status)
                    .HasConversion<string>()
                    .HasMaxLength(40)
                    .IsRequired();

                entity.Property(x => x.PlanJson)
                    .HasColumnType("text");

                entity.Property(x => x.RecommendationJson)
                    .HasColumnType("text");

                entity.Property(x => x.DecisionComment)
                    .HasMaxLength(1000);

                entity.Property(x => x.FailureReason)
                    .HasMaxLength(2000);

                entity.Property(x => x.CreatedAt)
                    .IsRequired();

                entity.Property(x => x.UpdatedAt)
                    .IsRequired();

                // Useful for recruiter workflow history.
                entity.HasIndex(x =>
                    new
                    {
                        x.RecruiterId,
                        x.CreatedAt
                    });

                // Useful for showing Agent runs for a job.
                entity.HasIndex(x =>
                    new
                    {
                        x.JobPostingId,
                        x.CreatedAt
                    });

                // Useful for locating pending approval workflows.
                entity.HasIndex(x =>
                    new
                    {
                        x.JobPostingId,
                        x.Status
                    });
            });

        // =====================================================
        // Skill Matching Agent Workflow Step
        // =====================================================

        modelBuilder.Entity<SkillMatchingShortlistingWorkflowStep>(
            entity =>
            {
                entity.ToTable(
                    "SkillMatchingAgentWorkflowSteps");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.AgentName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(x => x.Status)
                    .HasConversion<string>()
                    .HasMaxLength(30)
                    .IsRequired();

                entity.Property(x => x.InputSummary)
                    .IsRequired()
                    .HasMaxLength(4000);

                entity.Property(x => x.OutputSummary)
                    .IsRequired()
                    .HasMaxLength(4000);

                entity.Property(x => x.ErrorMessage)
                    .HasMaxLength(2000);

                entity.Property(x => x.StartedAt)
                    .IsRequired();

                // A workflow cannot contain two steps
                // with the same sequence number.
                entity.HasIndex(x =>
                    new
                    {
                        x.WorkflowId,
                        x.StepNumber
                    })
                    .IsUnique();

                entity.HasOne(x => x.Workflow)
                    .WithMany(x => x.Steps)
                    .HasForeignKey(x => x.WorkflowId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
    }
}