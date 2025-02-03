using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bliss.Migrations
{
    /// <inheritdoc />
    public partial class AddedType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Products",
                type: "varchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2026, 2, 3, 19, 13, 29, 526, DateTimeKind.Utc).AddTicks(2059), new DateTime(2025, 2, 3, 19, 13, 29, 526, DateTimeKind.Utc).AddTicks(2056) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2026, 2, 3, 19, 13, 29, 526, DateTimeKind.Utc).AddTicks(2071), new DateTime(2025, 2, 3, 19, 13, 29, 526, DateTimeKind.Utc).AddTicks(2070) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2026, 2, 3, 19, 13, 29, 526, DateTimeKind.Utc).AddTicks(2073), new DateTime(2025, 2, 3, 19, 13, 29, 526, DateTimeKind.Utc).AddTicks(2072) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Products");

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2026, 2, 3, 16, 11, 28, 621, DateTimeKind.Utc).AddTicks(5640), new DateTime(2025, 2, 3, 16, 11, 28, 621, DateTimeKind.Utc).AddTicks(5636) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2026, 2, 3, 16, 11, 28, 621, DateTimeKind.Utc).AddTicks(5650), new DateTime(2025, 2, 3, 16, 11, 28, 621, DateTimeKind.Utc).AddTicks(5650) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2026, 2, 3, 16, 11, 28, 621, DateTimeKind.Utc).AddTicks(5652), new DateTime(2025, 2, 3, 16, 11, 28, 621, DateTimeKind.Utc).AddTicks(5652) });
        }
    }
}
