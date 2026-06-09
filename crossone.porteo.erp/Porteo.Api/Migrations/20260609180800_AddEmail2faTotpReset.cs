using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Porteo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmail2faTotpReset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResetToken",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResetTokenExpires",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TotpEnabled",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TotpSecret",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VerificationCode",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "VerificationCodeExpires",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResetToken",
                table: "users");

            migrationBuilder.DropColumn(
                name: "ResetTokenExpires",
                table: "users");

            migrationBuilder.DropColumn(
                name: "TotpEnabled",
                table: "users");

            migrationBuilder.DropColumn(
                name: "TotpSecret",
                table: "users");

            migrationBuilder.DropColumn(
                name: "VerificationCode",
                table: "users");

            migrationBuilder.DropColumn(
                name: "VerificationCodeExpires",
                table: "users");
        }
    }
}
