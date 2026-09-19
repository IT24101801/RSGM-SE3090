using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RSGM.Api.Migrations
{
    public partial class FinalizeMergedRecruiterJobSeekerModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // No database changes are required here.
            //
            // The Job Seeker and Recruiter database structures
            // were already created by previous migrations.
            //
            // This migration exists to synchronize the EF Core
            // model snapshot after merging both branches.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No database changes to reverse.
        }
    }
}