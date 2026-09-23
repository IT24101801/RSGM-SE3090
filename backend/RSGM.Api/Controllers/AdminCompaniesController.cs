using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RSGM.Api.Common;
using RSGM.Api.Models.DTOs.Companies;
using RSGM.Api.Services;

namespace RSGM.Api.Controllers;

[ApiController]
[Route("api/admin/companies")]
[Authorize(Roles = AppRoles.SystemAdmin)]
public class AdminCompaniesController : ControllerBase
{
    private readonly AdminCompanyService _service;

    public AdminCompaniesController(AdminCompanyService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var company = await _service.GetByIdAsync(id);
        return company == null
            ? NotFound(new { message = "Company not found." })
            : Ok(company);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCompanyRequest request)
    {
        var result = await _service.CreateAsync(request);
        if (result.Result == CompanyOperationResult.DuplicateName)
            return Conflict(new { message = "A company with this name already exists." });

        return CreatedAtAction(nameof(GetById), new { id = result.Company!.Id }, result.Company);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateCompanyRequest request)
    {
        var result = await _service.UpdateAsync(id, request);
        return result.Result switch
        {
            CompanyOperationResult.NotFound => NotFound(new { message = "Company not found." }),
            CompanyOperationResult.DuplicateName => Conflict(new
                { message = "A company with this name already exists." }),
            _ => Ok(result.Company)
        };
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateCompanyStatusRequest request)
    {
        var result = await _service.UpdateStatusAsync(id, request.IsActive);
        return result.Result == CompanyOperationResult.NotFound
            ? NotFound(new { message = "Company not found." })
            : Ok(result.Company);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _service.DeleteAsync(id);
        return result switch
        {
            CompanyOperationResult.NotFound => NotFound(new { message = "Company not found." }),
            CompanyOperationResult.HasRelatedData => Conflict(new
                { message = "Remove all company members and job postings before deleting this company." }),
            _ => NoContent()
        };
    }

    [HttpPost("{companyId:guid}/members")]
    public async Task<IActionResult> AssignMember(
        Guid companyId,
        AssignCompanyMemberRequest request)
    {
        var result = await _service.AssignMemberAsync(companyId, request.UserId);
        return result switch
        {
            CompanyOperationResult.NotFound => NotFound(new { message = "Company not found." }),
            CompanyOperationResult.CompanyInactive => BadRequest(new
                { message = "Users cannot be assigned to an inactive company." }),
            CompanyOperationResult.UserNotFound => NotFound(new
                { message = "Active user not found." }),
            CompanyOperationResult.InvalidMemberRole => BadRequest(new
                { message = "Only Recruiters, HR Managers, and Hiring Panelists can join a company." }),
            _ => Ok(new { message = "User assigned to the company successfully." })
        };
    }

    [HttpDelete("{companyId:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid companyId, Guid userId)
    {
        var result = await _service.RemoveMemberAsync(companyId, userId);
        return result switch
        {
            CompanyOperationResult.NotFound => NotFound(new { message = "Company membership not found." }),
            CompanyOperationResult.StaffRequiresCompany => BadRequest(new
                { message = "Staff must belong to a company. Change their role or transfer them to another company first." }),
            _ => NoContent()
        };
    }
}
