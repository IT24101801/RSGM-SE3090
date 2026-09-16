using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/jobseeker/cv")]
[Authorize(Roles = AppRoles.JobSeeker)]
public class JobSeekerCvController : ControllerBase
{
    private readonly JobSeekerCvService _cvService;

    public JobSeekerCvController(JobSeekerCvService cvService)
    {
        _cvService = cvService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyCv()
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var cv = await _cvService.GetMetadataAsync(userId.Value);

        if (cv == null)
        {
            return NotFound(new
            {
                message = "No CV uploaded yet."
            });
        }

        return Ok(cv);
    }

    [HttpPost]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadCv(IFormFile file)
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        if (file == null)
        {
            return BadRequest(new
            {
                message = "No file was provided."
            });
        }

        var (result, cv) = await _cvService.UploadAsync(userId.Value, file);

        return result switch
        {
            UploadCvResult.Success => Ok(cv),
            UploadCvResult.InvalidFileType => BadRequest(new
            {
                message = "Only .pdf, .doc, and .docx files are allowed."
            }),
            UploadCvResult.FileTooLarge => BadRequest(new
            {
                message = "File must be smaller than 5 MB."
            }),
            UploadCvResult.EmptyFile => BadRequest(new
            {
                message = "The uploaded file is empty."
            }),
            _ => BadRequest()
        };
    }

    [HttpGet("download")]
    public async Task<IActionResult> DownloadMyCv()
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var file = await _cvService.GetFileForDownloadAsync(userId.Value);

        if (file == null)
        {
            return NotFound(new
            {
                message = "No CV uploaded yet."
            });
        }

        return File(file.Value.Stream, file.Value.ContentType, file.Value.FileName);
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteMyCv()
    {
        var userId = GetCurrentUserId();

        if (userId == null)
        {
            return Unauthorized();
        }

        var deleted = await _cvService.DeleteAsync(userId.Value);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "No CV uploaded yet."
            });
        }

        return NoContent();
    }

    private Guid? GetCurrentUserId()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return Guid.TryParse(idClaim, out var id) ? id : null;
    }
}