using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;
using RSGM.Api.Models.DTOs.JobSeeker;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Services;

public enum UploadCvResult
{
    Success,
    InvalidFileType,
    FileTooLarge,
    EmptyFile
}

public class JobSeekerCvService
{
    private static readonly string[] AllowedExtensions = { ".pdf", ".doc", ".docx" };
    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public JobSeekerCvService(
        ApplicationDbContext context,
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _context = context;
        _environment = environment;
        _configuration = configuration;
    }

    public async Task<CvResponse?> GetMetadataAsync(Guid userId)
    {
        var cv = await _context.JobSeekerCvs
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId);

        return cv == null ? null : ToResponse(cv);
    }

    public async Task<(UploadCvResult Result, CvResponse? Cv)> UploadAsync(
        Guid userId,
        IFormFile file)
    {
        if (file.Length == 0)
        {
            return (UploadCvResult.EmptyFile, null);
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return (UploadCvResult.FileTooLarge, null);
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!AllowedExtensions.Contains(extension))
        {
            return (UploadCvResult.InvalidFileType, null);
        }

        var uploadDirectory = GetUploadDirectory();
        Directory.CreateDirectory(uploadDirectory);

        // Generated name — never trust the original filename for storage.
        var storedFileName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(uploadDirectory, storedFileName);

        await using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var existing = await _context.JobSeekerCvs
            .FirstOrDefaultAsync(x => x.UserId == userId);

        // Replacing an existing CV — delete the old file from disk.
        if (existing != null)
        {
            DeleteFileIfExists(existing.StoredFileName);
            _context.JobSeekerCvs.Remove(existing);
        }

        var cv = new JobSeekerCv
        {
            UserId = userId,
            FileName = file.FileName,
            StoredFileName = storedFileName,
            ContentType = file.ContentType,
            FileSizeBytes = file.Length
        };

        _context.JobSeekerCvs.Add(cv);

        await _context.SaveChangesAsync();

        return (UploadCvResult.Success, ToResponse(cv));
    }

    public async Task<(Stream Stream, string ContentType, string FileName)?> GetFileForDownloadAsync(
        Guid userId)
    {
        var cv = await _context.JobSeekerCvs
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (cv == null)
        {
            return null;
        }

        var fullPath = Path.Combine(GetUploadDirectory(), cv.StoredFileName);

        if (!File.Exists(fullPath))
        {
            return null;
        }

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);

        return (stream, cv.ContentType, cv.FileName);
    }

    public async Task<bool> DeleteAsync(Guid userId)
    {
        var cv = await _context.JobSeekerCvs
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (cv == null)
        {
            return false;
        }

        DeleteFileIfExists(cv.StoredFileName);

        _context.JobSeekerCvs.Remove(cv);

        await _context.SaveChangesAsync();

        return true;
    }

    private string GetUploadDirectory()
    {
        var configuredPath = _configuration["Storage:CvUploadPath"];

        return string.IsNullOrWhiteSpace(configuredPath)
            ? Path.Combine(_environment.ContentRootPath, "App_Data", "uploads", "cvs")
            : configuredPath;
    }

    private void DeleteFileIfExists(string storedFileName)
    {
        var fullPath = Path.Combine(GetUploadDirectory(), storedFileName);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }

    private static CvResponse ToResponse(JobSeekerCv cv)
    {
        return new CvResponse
        {
            FileName = cv.FileName,
            FileSizeBytes = cv.FileSizeBytes,
            UploadedAt = cv.UploadedAt
        };
    }
}