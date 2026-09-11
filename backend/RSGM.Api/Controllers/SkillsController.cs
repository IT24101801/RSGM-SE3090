using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/skills")]
[Authorize]
public class SkillsController : ControllerBase
{
    private readonly SkillService _skillService;

    public SkillsController(
        SkillService skillService)
    {
        _skillService = skillService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var skills =
            await _skillService.GetAllAsync();

        return Ok(skills);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id)
    {
        var skill =
            await _skillService.GetByIdAsync(id);

        if (skill == null)
        {
            return NotFound(new
            {
                message = "Skill not found."
            });
        }

        return Ok(skill);
    }
}