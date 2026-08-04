using System.Security.Claims;
using ECommerceApp.Frontend.Models;
using ECommerceApp.Frontend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

public class AccountController : Controller
{
    private readonly ApiClient _apiClient;

    public AccountController(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    [HttpGet]
    public IActionResult Login(string? returnUrl = null)
    {
        return View(new LoginVm { ReturnUrl = returnUrl });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginVm model)
    {
        if (!ModelState.IsValid) return View(model);

        var (success, error, result) = await _apiClient.LoginAsync(model);
        if (!success || result is null)
        {
            ModelState.AddModelError(string.Empty, error ?? "Invalid login attempt.");
            return View(model);
        }

        await SignInAsync(result);

        if (!string.IsNullOrEmpty(model.ReturnUrl) && Url.IsLocalUrl(model.ReturnUrl))
            return Redirect(model.ReturnUrl);

        return RedirectToAction("Index", "Home");
    }

    [HttpGet]
    public IActionResult Register()
    {
        return View(new RegisterVm());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterVm model)
    {
        if (!ModelState.IsValid) return View(model);

        var (success, error, result) = await _apiClient.RegisterAsync(model);
        if (!success || result is null)
        {
            ModelState.AddModelError(string.Empty, error ?? "Could not create account.");
            return View(model);
        }

        await SignInAsync(result);
        return RedirectToAction("Index", "Home");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Index", "Home");
    }

    public IActionResult AccessDenied()
    {
        return View();
    }

    private async Task SignInAsync(AuthResultVm result)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Email, result.Email),
            new(ClaimTypes.Name, result.FullName),
            new("jwt", result.Token)
        };
        claims.AddRange(result.Roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
    }
}
