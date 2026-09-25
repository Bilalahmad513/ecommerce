using ECommerceApp.Frontend.Models;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

public class AccountController : Controller
{
    [HttpGet]
    public IActionResult Login(string? returnUrl = null)
    {
        return View(new LoginVm { ReturnUrl = returnUrl });
    }

    [HttpGet]
    public IActionResult Register()
    {
        return View();
    }

    public IActionResult AccessDenied()
    {
        return View();
    }
}
