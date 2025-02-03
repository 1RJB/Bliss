using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Bliss.Migrations
{
    /// <inheritdoc />
    public partial class Testing2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Memberships");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Memberships",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Benefits = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true),
                    Cost = table.Column<int>(type: "int", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Memberships", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.InsertData(
                table: "Memberships",
                columns: new[] { "Id", "Benefits", "Cost", "EndDate", "StartDate", "Type" },
                values: new object[,]
                {
                    { 1, "Access to basic features", 0, new DateTime(2026, 2, 3, 12, 54, 34, 513, DateTimeKind.Utc).AddTicks(8791), new DateTime(2025, 2, 3, 12, 54, 34, 513, DateTimeKind.Utc).AddTicks(8788), 0 },
                    { 2, "Access to green features", 50, new DateTime(2026, 2, 3, 12, 54, 34, 513, DateTimeKind.Utc).AddTicks(8799), new DateTime(2025, 2, 3, 12, 54, 34, 513, DateTimeKind.Utc).AddTicks(8799), 1 },
                    { 3, "Access to all features", 100, new DateTime(2026, 2, 3, 12, 54, 34, 513, DateTimeKind.Utc).AddTicks(8801), new DateTime(2025, 2, 3, 12, 54, 34, 513, DateTimeKind.Utc).AddTicks(8801), 2 }
                });
        }
    }
}
