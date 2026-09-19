using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RSGM.Api.Migrations
{
    public partial class AddCompanyOwnershipAndSkillMatchingFoundation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // -----------------------------------------------------
            // Job Seeker skill matching
            // -----------------------------------------------------

            migrationBuilder.AddColumn<int>(
                name: "ProficiencyLevel",
                table: "JobSeekerSkills",
                type: "integer",
                nullable: false,
                defaultValue: 3);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "JobSeekerSkills",
                type: "timestamp with time zone",
                nullable: true);

            // -----------------------------------------------------
            // Recruiter job skill weighting
            // -----------------------------------------------------

            migrationBuilder.AddColumn<decimal>(
                name: "Weight",
                table: "JobPostingSkills",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 1.0m);

            // -----------------------------------------------------
            // Company normalized name
            // -----------------------------------------------------

            // Step 1:
            // Add NormalizedName as nullable first.
            // This avoids giving all existing companies the same
            // empty-string value.
            migrationBuilder.AddColumn<string>(
                name: "NormalizedName",
                table: "Companies",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            // Step 2:
            // Populate NormalizedName using the existing Name value.
            //
            // Example:
            // Millennium IT -> MILLENNIUM IT
            // Northwind     -> NORTHWIND
            migrationBuilder.Sql(
                """
                UPDATE "Companies"
                SET "NormalizedName" = UPPER(TRIM("Name"));
                """);

            // Step 3:
            // After all existing rows have a normalized value,
            // make the column required.
            migrationBuilder.AlterColumn<string>(
                name: "NormalizedName",
                table: "Companies",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150,
                oldNullable: true);

            // Step 4:
            // Create the unique index after the values are populated.
            migrationBuilder.CreateIndex(
                name: "IX_Companies_NormalizedName",
                table: "Companies",
                column: "NormalizedName",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Companies_NormalizedName",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "ProficiencyLevel",
                table: "JobSeekerSkills");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "JobSeekerSkills");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "JobPostingSkills");

            migrationBuilder.DropColumn(
                name: "NormalizedName",
                table: "Companies");
        }
    }
}