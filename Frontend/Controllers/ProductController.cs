using ECommerceApp.Frontend.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

public class ProductController : Controller
{
    private readonly ApiClient _apiClient;

    public ProductController(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<IActionResult> Details(int id)
    {
        var product = await _apiClient.GetProductAsync(id);
        if (product is null) return NotFound();

        return View(product);
    }
}
