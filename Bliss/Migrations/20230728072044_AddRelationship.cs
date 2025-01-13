using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bliss.Migrations
{
    /// <inheritdoc />
    public partial class AddRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Tutorials",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Tutorials_UserId",
                table: "Tutorials",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tutorials_Users_UserId",
                table: "Tutorials",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tutorials_Users_UserId",
                table: "Tutorials");

            migrationBuilder.DropIndex(
                name: "IX_Tutorials_UserId",
                table: "Tutorials");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Tutorials");
        }
    }
}
