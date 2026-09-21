using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using RSGM.Api.Data;

#nullable disable

namespace RSGM.Api.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260921090000_AddFinalHiringWorkflow")]
public partial class AddFinalHiringWorkflow : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_UserAvailabilities_UserId_StartsAt",
            table: "UserAvailabilities");

        // Previous rows represented available slots and must not be reinterpreted as meetings.
        migrationBuilder.Sql("DELETE FROM \"UserAvailabilities\";");

        migrationBuilder.AddColumn<string>(
            name: "Description",
            table: "UserAvailabilities",
            type: "character varying(500)",
            maxLength: 500,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "Title",
            table: "UserAvailabilities",
            type: "character varying(150)",
            maxLength: 150,
            nullable: false,
            defaultValue: "Busy");

        migrationBuilder.AddColumn<decimal>(
            name: "DesiredSalary",
            table: "InterviewFeedbacks",
            type: "numeric(18,2)",
            precision: 18,
            scale: 2,
            nullable: false,
            defaultValue: 0m);

        migrationBuilder.AddColumn<string>(
            name: "DesiredSalaryCurrency",
            table: "InterviewFeedbacks",
            type: "character varying(3)",
            maxLength: 3,
            nullable: false,
            defaultValue: "LKR");

        migrationBuilder.AddColumn<string>(
            name: "CandidateDeclineReason",
            table: "Offers",
            type: "character varying(1000)",
            maxLength: 1000,
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "RespondedAt",
            table: "Offers",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_UserAvailabilities_UserId_StartsAt_EndsAt",
            table: "UserAvailabilities",
            columns: new[] { "UserId", "StartsAt", "EndsAt" },
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_UserAvailabilities_UserId_StartsAt_EndsAt",
            table: "UserAvailabilities");

        migrationBuilder.DropColumn(name: "Description", table: "UserAvailabilities");
        migrationBuilder.DropColumn(name: "Title", table: "UserAvailabilities");
        migrationBuilder.DropColumn(name: "DesiredSalary", table: "InterviewFeedbacks");
        migrationBuilder.DropColumn(name: "DesiredSalaryCurrency", table: "InterviewFeedbacks");
        migrationBuilder.DropColumn(name: "CandidateDeclineReason", table: "Offers");
        migrationBuilder.DropColumn(name: "RespondedAt", table: "Offers");

        migrationBuilder.CreateIndex(
            name: "IX_UserAvailabilities_UserId_StartsAt",
            table: "UserAvailabilities",
            columns: new[] { "UserId", "StartsAt" },
            unique: true);
    }
}
