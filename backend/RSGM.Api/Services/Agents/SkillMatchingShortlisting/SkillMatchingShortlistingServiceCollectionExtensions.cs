using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RSGM.Api.Data;
using RSGM.Api.Tools.SkillMatchingShortlisting;

namespace RSGM.Api.Services.Agents.SkillMatchingShortlisting;

/// <summary>
/// Dependency-injection registration for the isolated
/// Skill Matching & Shortlisting Agent.
///
/// Program.cs will call this extension later.
/// </summary>
public static class SkillMatchingShortlistingServiceCollectionExtensions
{
    public static IServiceCollection
        AddSkillMatchingShortlistingAgent(
            this IServiceCollection services,
            IConfiguration configuration,
            string connectionString)
    {
        if (string.IsNullOrWhiteSpace(
                connectionString))
        {
            throw new ArgumentException(
                "Database connection string is required.",
                nameof(connectionString));
        }

        // =====================================================
        // Groq configuration
        // =====================================================

        services.Configure<GroqOptions>(
            configuration.GetSection("Groq"));

        services.AddHttpClient<GroqLlmService>(
            client =>
            {
                var timeoutSeconds =
                    configuration.GetValue<int?>(
                        "Groq:TimeoutSeconds")
                    ?? 60;

                client.Timeout =
                    TimeSpan.FromSeconds(
                        Math.Clamp(
                            timeoutSeconds,
                            1,
                            300));
            });

        // =====================================================
        // Isolated Agent workflow database
        // =====================================================

        services.AddDbContext<
            SkillMatchingShortlistingDbContext>(
            options =>
                options.UseNpgsql(
                    connectionString,
                    npgsql =>
                        npgsql.MigrationsHistoryTable(
                            "__SkillMatchingShortlistingMigrationsHistory")));

        // =====================================================
        // Controlled tools
        // =====================================================

        services.AddScoped<
            GetSkillMatchingJobRequirementsTool>();

        services.AddScoped<
            GetEligibleSkillMatchingCandidatesTool>();

        services.AddScoped<
            CalculateSkillMatchTool>();

        services.AddScoped<
            GenerateSkillGapTool>();

        services.AddScoped<
            ValidateSkillMatchingShortlistTool>();

        // =====================================================
        // Central allow-list
        // =====================================================

        services.AddScoped<
            SkillMatchingAgentToolRegistry>();

        return services;
    }
}