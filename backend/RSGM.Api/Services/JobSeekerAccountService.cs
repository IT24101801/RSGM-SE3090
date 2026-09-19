using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public enum DeleteJobSeekerAccountResult
{
    Success,
    UserNotFound,
    InvalidPassword,
    Failed
}

public class JobSeekerAccountService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    private readonly ILogger<JobSeekerAccountService> _logger;

    public JobSeekerAccountService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        IWebHostEnvironment environment,
        IConfiguration configuration,
        ILogger<JobSeekerAccountService> logger)
    {
        _context = context;
        _userManager = userManager;
        _environment = environment;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<(
        DeleteJobSeekerAccountResult Result,
        IEnumerable<string> Errors)> DeleteAsync(
            Guid userId,
            string currentPassword)
    {
        var user = await _userManager.FindByIdAsync(
            userId.ToString());

        if (user == null)
        {
            return (
                DeleteJobSeekerAccountResult.UserNotFound,
                Array.Empty<string>());
        }

        var passwordCorrect =
            await _userManager.CheckPasswordAsync(
                user,
                currentPassword);

        if (!passwordCorrect)
        {
            return (
                DeleteJobSeekerAccountResult.InvalidPassword,
                Array.Empty<string>());
        }

        // Save the CV filename before deleting its database row.
        var storedCvFileName = await _context.JobSeekerCvs
            .Where(cv => cv.UserId == userId)
            .Select(cv => cv.StoredFileName)
            .FirstOrDefaultAsync();

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            // Related records are removed through cascade deletion.
            var deleteResult =
                await _userManager.DeleteAsync(user);

            if (!deleteResult.Succeeded)
            {
                await transaction.RollbackAsync();

                return (
                    DeleteJobSeekerAccountResult.Failed,
                    deleteResult.Errors
                        .Select(error => error.Description)
                        .ToArray());
            }

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        // Delete the physical CV file after database deletion succeeds.
        if (!string.IsNullOrWhiteSpace(storedCvFileName))
        {
            try
            {
                DeleteCvFileIfExists(storedCvFileName);
            }
            catch (Exception exception)
            {
                _logger.LogWarning(
                    exception,
                    "Account {UserId} was deleted, but CV file {StoredFileName} could not be removed.",
                    userId,
                    storedCvFileName);
            }
        }

        return (
            DeleteJobSeekerAccountResult.Success,
            Array.Empty<string>());
    }

    private void DeleteCvFileIfExists(string storedFileName)
    {
        var configuredPath =
            _configuration["Storage:CvUploadPath"];

        var uploadDirectory =
            string.IsNullOrWhiteSpace(configuredPath)
                ? Path.Combine(
                    _environment.ContentRootPath,
                    "App_Data",
                    "uploads",
                    "cvs")
                : configuredPath;

        var fullPath = Path.Combine(
            uploadDirectory,
            storedFileName);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }
}