using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RSGM.Api.Migrations
{
    public partial class LinkApprovedRequisitionToJobPosting : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Nullable so jobs created before Phase 2 remain available.
            migrationBuilder.AddColumn<Guid>(
                name: "JobRequisitionId",
                table: "JobPostings",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_JobRequisitionId",
                table: "JobPostings",
                column: "JobRequisitionId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_JobPostings_JobRequisitions_JobRequisitionId",
                table: "JobPostings",
                column: "JobRequisitionId",
                principalTable: "JobRequisitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobPostings_JobRequisitions_JobRequisitionId",
                table: "JobPostings");

            migrationBuilder.DropIndex(
                name: "IX_JobPostings_JobRequisitionId",
                table: "JobPostings");

            migrationBuilder.DropColumn(
                name: "JobRequisitionId",
                table: "JobPostings");
        }
    }
}
