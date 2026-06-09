using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Porteo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileAndTwoFactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Fonction",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsTwoFactorEnabled",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Telephone",
                table: "users",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Fonction",
                table: "users");

            migrationBuilder.DropColumn(
                name: "IsTwoFactorEnabled",
                table: "users");

            migrationBuilder.DropColumn(
                name: "Telephone",
                table: "users");
        }
    }
}
