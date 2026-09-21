using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using RSGM.Api.Models.Entities;
using RSGM.Api.Services;

namespace RSGM.Api.Tests;

public class TokenServiceTests
{
    [Fact]
    public void CreateToken_ShouldContainUserInformationAndRole()
    {
        // Arrange
        var settings = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "ThisIsAVeryStrongTestJwtKeyForRSGM123456789",
            ["Jwt:Issuer"] = "RSGM.Test",
            ["Jwt:Audience"] = "RSGM.Test.Users",
            ["Jwt:ExpiryMinutes"] = "60"
        };

        IConfiguration configuration =
            new ConfigurationBuilder()
                .AddInMemoryCollection(settings)
                .Build();

        var tokenService = new TokenService(configuration);

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            FullName = "Test User",
            Email = "test@rsgm.com"
        };

        var roles = new List<string>
        {
            "JobSeeker"
        };

        // Act
        var token = tokenService.CreateToken(user, roles);

        var handler = new JwtSecurityTokenHandler();

        var jwtToken = handler.ReadJwtToken(token);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);

        Assert.Contains(
            jwtToken.Claims,
            claim =>
                claim.Type == ClaimTypes.Email &&
                claim.Value == "test@rsgm.com"
        );

        Assert.Contains(
            jwtToken.Claims,
            claim =>
                claim.Type == ClaimTypes.Role &&
                claim.Value == "JobSeeker"
        );
    }
}