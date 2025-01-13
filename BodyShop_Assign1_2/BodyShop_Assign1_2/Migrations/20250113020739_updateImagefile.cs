using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BodyShop_Assign1_2.Migrations
{
    /// <inheritdoc />
    public partial class updateImagefile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageFile",
                table: "Products",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageFile",
                table: "Products");
        }
    }
}
