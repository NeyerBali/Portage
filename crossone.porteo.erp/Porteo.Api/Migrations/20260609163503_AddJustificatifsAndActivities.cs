using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Porteo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddJustificatifsAndActivities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "activity_entries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Titre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    UserName = table.Column<string>(type: "text", nullable: true),
                    ConsultantId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_activity_entries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "justificatifs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Libelle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Montant = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    DateJustificatif = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    MotifRefus = table.Column<string>(type: "text", nullable: true),
                    DateTraitement = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FileName = table.Column<string>(type: "text", nullable: true),
                    ContentType = table.Column<string>(type: "text", nullable: true),
                    Data = table.Column<byte[]>(type: "bytea", nullable: true),
                    MissionId = table.Column<int>(type: "integer", nullable: false),
                    ConsultantId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_justificatifs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_justificatifs_consultants_ConsultantId",
                        column: x => x.ConsultantId,
                        principalTable: "consultants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_justificatifs_missions_MissionId",
                        column: x => x.MissionId,
                        principalTable: "missions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_activity_entries_CreatedAt",
                table: "activity_entries",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_justificatifs_ConsultantId",
                table: "justificatifs",
                column: "ConsultantId");

            migrationBuilder.CreateIndex(
                name: "IX_justificatifs_MissionId",
                table: "justificatifs",
                column: "MissionId");

            migrationBuilder.CreateIndex(
                name: "IX_justificatifs_Statut",
                table: "justificatifs",
                column: "Statut");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "activity_entries");

            migrationBuilder.DropTable(
                name: "justificatifs");
        }
    }
}
