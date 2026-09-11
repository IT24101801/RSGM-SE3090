using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Models.DTOs.Skills;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/admin/skills")]
[Authorize(Roles = AppRoles.SystemAdmin)]
public class AdminSkillsController : ControllerBase
{
    private readonly SkillService _skillService;

    public AdminSkillsController(
        SkillService skillService)
    {
        _skillService = skillService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateSkillRequest request)
    {
        var result =
            await _skillService.CreateAsync(
                request);

        if (result == null)
        {
            return Conflict(new
            {
                message =
                    "A skill with this name already exists."
            });
        }

        return CreatedAtAction(
            nameof(SkillsController.GetById),
            "Skills",
            new { id = result.Id },
            result);
    }


    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateSkillRequest request)
    {
        var success =
            await _skillService.UpdateAsync(
                id,
                request);

        if (!success)
        {
            return BadRequest(new
            {
                message =
                    "Unable to update skill."
            });
        }

        return NoContent();
    }


    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Deactivate(
        Guid id)
    {
        var success =
            await _skillService
                .DeactivateAsync(id);

        if (!success)
        {
            return NotFound(new
            {
                message =
                    "Skill not found."
            });
        }

        return NoContent();
    }
}