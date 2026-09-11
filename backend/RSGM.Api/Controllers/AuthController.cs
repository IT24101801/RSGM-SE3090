using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Models.DTOs.Auth;
using RSGM.Api.Models.Entities;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        TokenService tokenService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        RegisterRequest request)
    {
        var existingUser =
            await _userManager.FindByEmailAsync(
                request.Email);

        if (existingUser != null)
        {
            return Conflict(new
            {
                message =
                    "A user with this email already exists."
            });
        }

        var user = new ApplicationUser
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            UserName =
                request.Email.Trim().ToLowerInvariant(),
            IsActive = true
        };

        var result =
            await _userManager.CreateAsync(
                user,
                request.Password);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Registration failed.",
                errors =
                    result.Errors.Select(e => e.Description)
            });
        }

        await _userManager.AddToRoleAsync(
            user,
            AppRoles.JobSeeker);

        var roles =
            await _userManager.GetRolesAsync(user);

        var token =
            _tokenService.CreateToken(user, roles);

        var expiryMinutes =
            _configuration.GetValue<int>(
                "Jwt:ExpiryMinutes");

        return Ok(new AuthResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            Token = token,
            Roles = roles,
            ExpiresAt =
                DateTime.UtcNow.AddMinutes(expiryMinutes)
        });
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login(
        LoginRequest request)
    {
        var user =
            await _userManager.FindByEmailAsync(
                request.Email);

        if (user == null)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid email or password."
            });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new
            {
                message =
                    "This account is inactive."
            });
        }

        var validPassword =
            await _userManager.CheckPasswordAsync(
                user,
                request.Password);

        if (!validPassword)
        {
            return Unauthorized(new
            {
                message =
                    "Invalid email or password."
            });
        }

        var roles =
            await _userManager.GetRolesAsync(user);

        var token =
            _tokenService.CreateToken(user, roles);

        var expiryMinutes =
            _configuration.GetValue<int>(
                "Jwt:ExpiryMinutes");

        return Ok(new AuthResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            Token = token,
            Roles = roles,
            ExpiresAt =
                DateTime.UtcNow.AddMinutes(expiryMinutes)
        });
    }
}