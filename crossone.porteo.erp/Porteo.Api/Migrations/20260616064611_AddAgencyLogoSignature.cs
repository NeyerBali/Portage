using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Porteo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAgencyLogoSignature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Logo",
                table: "agency_profile",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Signature",
                table: "agency_profile",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Logo",
                table: "agency_profile");

            migrationBuilder.DropColumn(
                name: "Signature",
                table: "agency_profile");
        }
    }
}
