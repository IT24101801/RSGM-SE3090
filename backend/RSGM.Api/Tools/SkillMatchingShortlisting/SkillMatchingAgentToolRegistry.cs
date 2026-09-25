using System.Collections.ObjectModel;
using System.Text.Json;

namespace RSGM.Api.Tools.SkillMatchingShortlisting;

/// <summary>
/// Central allow-list for tools available to the
/// four Skill Matching & Shortlisting Agent roles.
///
/// Agents cannot execute arbitrary methods or arbitrary
/// database operations.
/// </summary>
public sealed class SkillMatchingAgentToolRegistry
{
    private readonly IReadOnlyDictionary<
        string,
        ISkillMatchingShortlistingTool> _tools;

    public SkillMatchingAgentToolRegistry(
        GetSkillMatchingJobRequirementsTool jobRequirementsTool,
        GetEligibleSkillMatchingCandidatesTool candidateRetrievalTool,
        CalculateSkillMatchTool calculateSkillMatchTool,
        GenerateSkillGapTool generateSkillGapTool,
        ValidateSkillMatchingShortlistTool validateShortlistTool)
    {
        var tools =
            new ISkillMatchingShortlistingTool[]
            {
                jobRequirementsTool,
                candidateRetrievalTool,
                calculateSkillMatchTool,
                generateSkillGapTool,
                validateShortlistTool
            };

        _tools =
            new ReadOnlyDictionary<
                string,
                ISkillMatchingShortlistingTool>(
                tools.ToDictionary(
                    tool => tool.Name,
                    StringComparer.Ordinal));
    }

    public IReadOnlyCollection<string> ToolNames =>
        _tools.Keys.ToArray();

    public bool IsToolRegistered(
        string toolName)
    {
        return !string.IsNullOrWhiteSpace(toolName) &&
               _tools.ContainsKey(toolName);
    }

    public bool IsAllowed(
        string agentName,
        string toolName)
    {
        return
            _tools.TryGetValue(
                toolName,
                out var tool) &&
            tool.AllowedAgents.Contains(
                agentName);
    }

    public IReadOnlyCollection<string> GetAllowedTools(
        string agentName)
    {
        return _tools.Values
            .Where(
                tool =>
                    tool.AllowedAgents.Contains(
                        agentName))
            .Select(
                tool =>
                    tool.Name)
            .OrderBy(
                name =>
                    name)
            .ToArray();
    }

    public Task<object> ExecuteAsync(
        string agentName,
        string toolName,
        Guid recruiterId,
        JsonElement arguments,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(agentName))
        {
            throw new ArgumentException(
                "Agent name is required.");
        }

        if (string.IsNullOrWhiteSpace(toolName))
        {
            throw new ArgumentException(
                "Tool name is required.");
        }

        if (!_tools.TryGetValue(
                toolName,
                out var tool))
        {
            throw new KeyNotFoundException(
                $"Tool '{toolName}' is not registered.");
        }

        if (!tool.AllowedAgents.Contains(
                agentName))
        {
            throw new UnauthorizedAccessException(
                $"Agent '{agentName}' is not allowed " +
                $"to execute tool '{toolName}'.");
        }

        return tool.ExecuteAsync(
            recruiterId,
            arguments,
            cancellationToken);
    }
}