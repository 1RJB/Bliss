using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bliss.Migrations
{
    /// <inheritdoc />
    public partial class OTPCheck : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2026, 2, 3, 12, 54, 34, 513, DateTimeKind.Utc).AddTicks(8791), new DateTime(2025, 2, 3, 12, 54, 34, 513, DateTimeKind.Utc).AddTicks(8788) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2026, 2, 3, 12, 54, 34, 513, DateTimeKind.Utc).AddTicks(8799), new DateTime(2025, 2, 3, 12, 54, 34, 513, DateTimeKind.Utc).AddTicks(8799) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2026, 2, 3, 12, 54, 34, 513, DateTimeKind.Utc).AddTicks(8801), new DateTime(2025, 2, 3, 12, 54, 34, 513, DateTimeKind.Utc).AddTicks(8801) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2026, 2, 3, 10, 22, 39, 623, DateTimeKind.Utc).AddTicks(3664), new DateTime(2025, 2, 3, 10, 22, 39, 623, DateTimeKind.Utc).AddTicks(3662) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2026, 2, 3, 10, 22, 39, 623, DateTimeKind.Utc).AddTicks(3674), new DateTime(2025, 2, 3, 10, 22, 39, 623, DateTimeKind.Utc).AddTicks(3674) });

            migrationBuilder.UpdateData(
                table: "Memberships",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "EndDate", "StartDate" },
                values: new object[] { new DateTime(2026, 2, 3, 10, 22, 39, 623, DateTimeKind.Utc).AddTicks(3677), new DateTime(2025, 2, 3, 10, 22, 39, 623, DateTimeKind.Utc).AddTicks(3676) });
        }
    }
}
