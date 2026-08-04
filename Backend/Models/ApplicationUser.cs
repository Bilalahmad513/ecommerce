using Microsoft.AspNetCore.Identity;

namespace ECommerceApp.Backend.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
}
