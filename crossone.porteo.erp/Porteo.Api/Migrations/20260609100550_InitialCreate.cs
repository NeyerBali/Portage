using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Porteo.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "clients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RaisonSociale = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Siret = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Secteur = table.Column<string>(type: "text", nullable: true),
                    Contact = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Telephone = table.Column<string>(type: "text", nullable: true),
                    Adresse = table.Column<string>(type: "text", nullable: true),
                    Ville = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "consultants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nom = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Prenom = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Telephone = table.Column<string>(type: "text", nullable: true),
                    Specialite = table.Column<string>(type: "text", nullable: true),
                    Tjm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Ville = table.Column<string>(type: "text", nullable: true),
                    Competences = table.Column<string>(type: "text", nullable: true),
                    Statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_consultants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "missions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Titre = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DateDebut = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DateFin = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Tjm = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Jours = table.Column<int>(type: "integer", nullable: false),
                    ClientId = table.Column<int>(type: "integer", nullable: false),
                    ConsultantId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_missions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_missions_clients_ClientId",
                        column: x => x.ClientId,
                        principalTable: "clients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_missions_consultants_ConsultantId",
                        column: x => x.ConsultantId,
                        principalTable: "consultants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<byte[]>(type: "bytea", nullable: true),
                    PasswordSalt = table.Column<byte[]>(type: "bytea", nullable: true),
                    Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Nom = table.Column<string>(type: "text", nullable: true),
                    Prenom = table.Column<string>(type: "text", nullable: true),
                    ConsultantId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_users_consultants_ConsultantId",
                        column: x => x.ConsultantId,
                        principalTable: "consultants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "factures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Numero = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    MontantHT = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Tva = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    MontantTTC = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Statut = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DateEmission = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DateEcheance = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MissionId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_factures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_factures_missions_MissionId",
                        column: x => x.MissionId,
                        principalTable: "missions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_consultants_Email",
                table: "consultants",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_factures_MissionId",
                table: "factures",
                column: "MissionId");

            migrationBuilder.CreateIndex(
                name: "IX_factures_Numero",
                table: "factures",
                column: "Numero",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_missions_ClientId",
                table: "missions",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_missions_ConsultantId",
                table: "missions",
                column: "ConsultantId");

            migrationBuilder.CreateIndex(
                name: "IX_missions_Statut",
                table: "missions",
                column: "Statut");

            migrationBuilder.CreateIndex(
                name: "IX_users_ConsultantId",
                table: "users",
                column: "ConsultantId");

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                table: "users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "factures");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "missions");

            migrationBuilder.DropTable(
                name: "clients");

            migrationBuilder.DropTable(
                name: "consultants");
        }
    }
}
