using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Porteo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRhConfigPayslip : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "absences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsultantId = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DateDebut = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DateFin = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NbJours = table.Column<decimal>(type: "numeric(6,1)", nullable: false),
                    Motif = table.Column<string>(type: "text", nullable: true),
                    Statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_absences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_absences_consultants_ConsultantId",
                        column: x => x.ConsultantId,
                        principalTable: "consultants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "agency_profile",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RaisonSociale = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Siret = table.Column<string>(type: "text", nullable: true),
                    TvaIntra = table.Column<string>(type: "text", nullable: true),
                    Adresse = table.Column<string>(type: "text", nullable: true),
                    Ville = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Telephone = table.Column<string>(type: "text", nullable: true),
                    SiteWeb = table.Column<string>(type: "text", nullable: true),
                    Iban = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agency_profile", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "cras",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MissionId = table.Column<int>(type: "integer", nullable: false),
                    ConsultantId = table.Column<int>(type: "integer", nullable: false),
                    Mois = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    JoursTravailles = table.Column<int>(type: "integer", nullable: false),
                    JoursAbsence = table.Column<int>(type: "integer", nullable: false),
                    Commentaire = table.Column<string>(type: "text", nullable: true),
                    Statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cras", x => x.Id);
                    table.ForeignKey(
                        name: "FK_cras_consultants_ConsultantId",
                        column: x => x.ConsultantId,
                        principalTable: "consultants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_cras_missions_MissionId",
                        column: x => x.MissionId,
                        principalTable: "missions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "demandes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsultantId = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Objet = table.Column<string>(type: "text", nullable: true),
                    Montant = table.Column<decimal>(type: "numeric(12,2)", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Reponse = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_demandes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_demandes_consultants_ConsultantId",
                        column: x => x.ConsultantId,
                        principalTable: "consultants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "global_parameters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Cle = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    Libelle = table.Column<string>(type: "text", nullable: true),
                    Valeur = table.Column<string>(type: "text", nullable: true),
                    Groupe = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_global_parameters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "payslips",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConsultantId = table.Column<int>(type: "integer", nullable: false),
                    Mois = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    JoursTravailles = table.Column<int>(type: "integer", nullable: false),
                    Facturable = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    FraisGestion = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Brut = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    ChargesSalariales = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    ChargesPatronales = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Net = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Statut = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payslips", x => x.Id);
                    table.ForeignKey(
                        name: "FK_payslips_consultants_ConsultantId",
                        column: x => x.ConsultantId,
                        principalTable: "consultants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_absences_ConsultantId",
                table: "absences",
                column: "ConsultantId");

            migrationBuilder.CreateIndex(
                name: "IX_cras_ConsultantId",
                table: "cras",
                column: "ConsultantId");

            migrationBuilder.CreateIndex(
                name: "IX_cras_MissionId",
                table: "cras",
                column: "MissionId");

            migrationBuilder.CreateIndex(
                name: "IX_demandes_ConsultantId",
                table: "demandes",
                column: "ConsultantId");

            migrationBuilder.CreateIndex(
                name: "IX_global_parameters_Cle",
                table: "global_parameters",
                column: "Cle",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_payslips_ConsultantId",
                table: "payslips",
                column: "ConsultantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "absences");

            migrationBuilder.DropTable(
                name: "agency_profile");

            migrationBuilder.DropTable(
                name: "cras");

            migrationBuilder.DropTable(
                name: "demandes");

            migrationBuilder.DropTable(
                name: "global_parameters");

            migrationBuilder.DropTable(
                name: "payslips");
        }
    }
}
