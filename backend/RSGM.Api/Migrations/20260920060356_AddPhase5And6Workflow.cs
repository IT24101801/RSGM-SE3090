using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RSGM.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPhase5And6Workflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "HrManagerId",
                table: "Interviews",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CandidateRecommendations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    InterviewId = table.Column<Guid>(type: "uuid", nullable: false),
                    PanelistId = table.Column<Guid>(type: "uuid", nullable: false),
                    HrManagerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Selected = table.Column<bool>(type: "boolean", nullable: false),
                    Rationale = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateRecommendations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateRecommendations_AspNetUsers_HrManagerId",
                        column: x => x.HrManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CandidateRecommendations_AspNetUsers_PanelistId",
                        column: x => x.PanelistId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CandidateRecommendations_Interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalTable: "Interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ShortlistDispatches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobPostingId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecruiterId = table.Column<Guid>(type: "uuid", nullable: false),
                    PanelistId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShortlistDispatches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShortlistDispatches_AspNetUsers_PanelistId",
                        column: x => x.PanelistId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShortlistDispatches_AspNetUsers_RecruiterId",
                        column: x => x.RecruiterId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShortlistDispatches_JobPostings_JobPostingId",
                        column: x => x.JobPostingId,
                        principalTable: "JobPostings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserAvailabilities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndsAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAvailabilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserAvailabilities_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ShortlistDispatchCandidates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DispatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Rank = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShortlistDispatchCandidates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShortlistDispatchCandidates_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShortlistDispatchCandidates_ShortlistDispatches_DispatchId",
                        column: x => x.DispatchId,
                        principalTable: "ShortlistDispatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_HrManagerId",
                table: "Interviews",
                column: "HrManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateRecommendations_HrManagerId",
                table: "CandidateRecommendations",
                column: "HrManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateRecommendations_InterviewId",
                table: "CandidateRecommendations",
                column: "InterviewId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CandidateRecommendations_PanelistId",
                table: "CandidateRecommendations",
                column: "PanelistId");

            migrationBuilder.CreateIndex(
                name: "IX_ShortlistDispatchCandidates_ApplicationId",
                table: "ShortlistDispatchCandidates",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ShortlistDispatchCandidates_DispatchId_ApplicationId",
                table: "ShortlistDispatchCandidates",
                columns: new[] { "DispatchId", "ApplicationId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShortlistDispatches_JobPostingId",
                table: "ShortlistDispatches",
                column: "JobPostingId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ShortlistDispatches_PanelistId",
                table: "ShortlistDispatches",
                column: "PanelistId");

            migrationBuilder.CreateIndex(
                name: "IX_ShortlistDispatches_RecruiterId",
                table: "ShortlistDispatches",
                column: "RecruiterId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAvailabilities_UserId_StartsAt",
                table: "UserAvailabilities",
                columns: new[] { "UserId", "StartsAt" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Interviews_AspNetUsers_HrManagerId",
                table: "Interviews",
                column: "HrManagerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Interviews_AspNetUsers_HrManagerId",
                table: "Interviews");

            migrationBuilder.DropTable(
                name: "CandidateRecommendations");

            migrationBuilder.DropTable(
                name: "ShortlistDispatchCandidates");

            migrationBuilder.DropTable(
                name: "UserAvailabilities");

            migrationBuilder.DropTable(
                name: "ShortlistDispatches");

            migrationBuilder.DropIndex(
                name: "IX_Interviews_HrManagerId",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "HrManagerId",
                table: "Interviews");
        }
    }
}
