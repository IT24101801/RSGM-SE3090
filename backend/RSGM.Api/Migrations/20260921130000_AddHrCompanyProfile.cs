using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using RSGM.Api.Data;

#nullable disable

namespace RSGM.Api.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260921130000_AddHrCompanyProfile")]
public partial class AddHrCompanyProfile : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(name: "CurrentEmployeeCount", table: "Companies",
            type: "integer", nullable: false, defaultValue: 0);
        migrationBuilder.AddColumn<DateTime>(name: "HrProfileCompletedAt", table: "Companies",
            type: "timestamp with time zone", nullable: true);
        migrationBuilder.AddColumn<string>(name: "MainDepartments", table: "Companies",
            type: "character varying(2000)", maxLength: 2000, nullable: true);
        migrationBuilder.AddColumn<string>(name: "MajorSkillRequirements", table: "Companies",
            type: "character varying(2000)", maxLength: 2000, nullable: true);
        migrationBuilder.AddColumn<string>(name: "OrganizationType", table: "Companies",
            type: "character varying(30)", maxLength: 30, nullable: true);
        migrationBuilder.AddColumn<int>(name: "WorkingLocationCount", table: "Companies",
            type: "integer", nullable: false, defaultValue: 0);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "CurrentEmployeeCount", table: "Companies");
        migrationBuilder.DropColumn(name: "HrProfileCompletedAt", table: "Companies");
        migrationBuilder.DropColumn(name: "MainDepartments", table: "Companies");
        migrationBuilder.DropColumn(name: "MajorSkillRequirements", table: "Companies");
        migrationBuilder.DropColumn(name: "OrganizationType", table: "Companies");
        migrationBuilder.DropColumn(name: "WorkingLocationCount", table: "Companies");
    }
}
