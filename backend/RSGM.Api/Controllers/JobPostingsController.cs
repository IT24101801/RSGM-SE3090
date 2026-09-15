using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/jobs")]
[Authorize(Roles = AppRoles.JobSeeker)]
public class JobPostingsController : ControllerBase
{
    private readonly JobPostingService _jobPostingService;

    public JobPostingsController(JobPostingService jobPostingService)
    {
        _jobPostingService = jobPostingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPublishedJobs()
    {
        var postings = await _jobPostingService.GetPublishedAsync();

        return Ok(postings);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetJobById(Guid id)
    {
        var posting = await _jobPostingService.GetPublishedByIdAsync(id);

        if (posting == null)
        {
            return NotFound(new
            {
                message = "Job posting not found."
            });
        }

        return Ok(posting);
    }
}