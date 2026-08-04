using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerceApp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderStatusWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSeenByCustomer",
                table: "Orders",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSeenByCustomer",
                table: "Orders");
        }
    }
}
