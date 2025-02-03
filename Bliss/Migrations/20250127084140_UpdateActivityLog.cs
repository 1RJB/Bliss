using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bliss.Migrations
{
    /// <inheritdoc />
    public partial class UpdateActivityLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "ActivityLogs",
                type: "double",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "ActivityLogs",
                type: "double",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "ActivityLogs");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "ActivityLogs");
        }
    }
}
