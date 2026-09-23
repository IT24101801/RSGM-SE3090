using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Common;
using RSGM.Api.Data;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Controllers;

public record UpdateHrCompanyProfileRequest(
    int CurrentEmployeeCount,
    int WorkingLocationCount,
    string OrganizationType,
    string MainDepartments,
    string MajorSkillRequirements);

[ApiController]
[Authorize(Roles = AppRoles.HRManager)]
[Route("api/hr/company-profile")]
public class HrCompanyProfileController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public HrCompanyProfileController(ApplicationDbContext db) => _db = db;

    private Guid UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
        ? id : Guid.Empty;

    private async Task<Company?> GetCompany() => await _db.CompanyMembers
        .Where(m => m.UserId == UserId && m.IsActive && m.Company.IsActive)
        .Select(m => m.Company)
        .FirstOrDefaultAsync();

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var company = await GetCompany();
        if (company == null) return NotFound(new { message = "No active company is assigned to this HR Manager." });
        return Ok(ToDto(company));
    }

    [HttpPut]
    public async Task<IActionResult> Update(UpdateHrCompanyProfileRequest request)
    {
        var organizationType = request.OrganizationType?.Trim();
        var departments = request.MainDepartments?.Trim();
        var skills = request.MajorSkillRequirements?.Trim();
        if (request.CurrentEmployeeCount < 0 || request.CurrentEmployeeCount > 10_000_000 ||
            request.WorkingLocationCount < 1 || request.WorkingLocationCount > 100_000 ||
            organizationType is not ("Local" or "International") ||
            string.IsNullOrWhiteSpace(departments) || departments.Length > 2000 ||
            string.IsNullOrWhiteSpace(skills) || skills.Length > 2000)
            return BadRequest(new { message = "Enter valid employee/location counts, organization type, departments, and major skills." });

        var company = await GetCompany();
        if (company == null) return NotFound(new { message = "No active company is assigned to this HR Manager." });
        company.CurrentEmployeeCount = request.CurrentEmployeeCount;
        company.WorkingLocationCount = request.WorkingLocationCount;
        company.OrganizationType = organizationType;
        company.MainDepartments = departments;
        company.MajorSkillRequirements = skills;
        company.HrProfileCompletedAt = DateTime.UtcNow;
        company.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(ToDto(company));
    }

    private static object ToDto(Company company) => new
    {
        company.Id,
        company.Name,
        company.CurrentEmployeeCount,
        company.WorkingLocationCount,
        company.OrganizationType,
        company.MainDepartments,
        company.MajorSkillRequirements,
        company.HrProfileCompletedAt,
        IsConfigured = company.HrProfileCompletedAt.HasValue
    };
}
