namespace RSGM.Api.Services.Agents.SkillMatchingShortlisting;

/// <summary>
/// Configuration for the Groq LLM used by the
/// Skill Matching & Shortlisting Agent.
///
/// ApiKey should come from User Secrets or an environment
/// variable and must never be committed to source control.
/// </summary>
public sealed class GroqOptions
{
    public string ApiKey { get; set; } = string.Empty;

    public string BaseUrl { get; set; } =
        "https://api.groq.com/openai/v1/chat/completions";

    public string Model { get; set; } =
        "openai/gpt-oss-20b";

    public int TimeoutSeconds { get; set; } = 60;

    public void Validate()
    {
        if (string.IsNullOrWhiteSpace(ApiKey))
        {
            throw new InvalidOperationException(
                "Groq API key is not configured. " +
                "Set Groq:ApiKey using .NET User Secrets " +
                "or an environment variable.");
        }

        if (string.IsNullOrWhiteSpace(BaseUrl))
        {
            throw new InvalidOperationException(
                "Groq BaseUrl is not configured.");
        }

        if (string.IsNullOrWhiteSpace(Model))
        {
            throw new InvalidOperationException(
                "Groq Model is not configured.");
        }

        if (TimeoutSeconds <= 0 ||
            TimeoutSeconds > 300)
        {
            throw new InvalidOperationException(
                "Groq TimeoutSeconds must be between 1 and 300.");
        }
    }
}