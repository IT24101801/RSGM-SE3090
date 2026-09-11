namespace RSGM.Api.Models.DTOs.Auth;

public class AuthResponse
{
    public Guid UserId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public IList<string> Roles { get; set; } = new List<string>();
}