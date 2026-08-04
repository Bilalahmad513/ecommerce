using ECommerceApp.Backend.Models;
using Microsoft.AspNetCore.Identity;

namespace ECommerceApp.Backend.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        string[] roles = { "Admin", "Customer" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        if (await userManager.FindByEmailAsync("admin@ecommerce.com") is null)
        {
            var admin = new ApplicationUser
            {
                UserName = "admin@ecommerce.com",
                Email = "admin@ecommerce.com",
                FullName = "Store Admin",
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(admin, "Admin@123");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }

        if (!context.Categories.Any())
        {
            var electronics = new Category { Name = "Electronics", Description = "Gadgets and devices" };
            var clothing = new Category { Name = "Clothing", Description = "Apparel for everyone" };
            var books = new Category { Name = "Books", Description = "Fiction and non-fiction" };

            context.Categories.AddRange(electronics, clothing, books);
            await context.SaveChangesAsync();

            context.Products.AddRange(
                new Product { Name = "Wireless Mouse", Description = "Ergonomic wireless mouse", Price = 1299, Stock = 50, CategoryId = electronics.Id },
                new Product { Name = "Bluetooth Headphones", Description = "Noise-cancelling over-ear headphones", Price = 4999, Stock = 30, CategoryId = electronics.Id },
                new Product { Name = "Cotton T-Shirt", Description = "100% cotton, unisex", Price = 799, Stock = 100, CategoryId = clothing.Id },
                new Product { Name = "Denim Jacket", Description = "Classic blue denim jacket", Price = 3499, Stock = 40, CategoryId = clothing.Id },
                new Product { Name = "C# Programming Guide", Description = "Learn C# from scratch", Price = 1499, Stock = 60, CategoryId = books.Id },
                new Product { Name = "ASP.NET Core in Action", Description = "Deep dive into ASP.NET Core", Price = 1999, Stock = 45, CategoryId = books.Id }
            );

            await context.SaveChangesAsync();
        }
    }
}
