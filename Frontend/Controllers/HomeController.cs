using System.Diagnostics;
using ECommerceApp.Frontend.Models;
using ECommerceApp.Frontend.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

public class HomeController : Controller
{
    private readonly ApiClient _apiClient;

    public HomeController(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<IActionResult> Index()
    {
        var products = await _apiClient.GetProductsAsync();
        return View(products);
    }

    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
