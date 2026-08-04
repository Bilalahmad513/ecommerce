using ECommerceApp.Frontend.Models;
using ECommerceApp.Frontend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

[Authorize]
public class CartController : Controller
{
    private readonly ApiClient _apiClient;
    private readonly CartSessionService _cart;

    public CartController(ApiClient apiClient, CartSessionService cart)
    {
        _apiClient = apiClient;
        _cart = cart;
    }

    public IActionResult Index()
    {
        var vm = new CheckoutVm { Items = _cart.GetCart() };
        return View(vm);
    }

    [HttpPost]
    public async Task<IActionResult> Add(int productId, int quantity = 1)
    {
        var product = await _apiClient.GetProductAsync(productId);
        if (product is null) return NotFound();

        _cart.AddItem(product, quantity);
        TempData["Message"] = $"{product.Name} added to cart.";
        return RedirectToAction("Index", "Home");
    }

    [HttpPost]
    public IActionResult UpdateQuantity(int productId, int quantity)
    {
        _cart.UpdateQuantity(productId, quantity);
        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public IActionResult Remove(int productId)
    {
        _cart.RemoveItem(productId);
        return RedirectToAction(nameof(Index));
    }
}
