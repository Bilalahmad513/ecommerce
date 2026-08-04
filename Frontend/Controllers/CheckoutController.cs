using System.Security.Claims;
using ECommerceApp.Frontend.Models;
using ECommerceApp.Frontend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

[Authorize]
public class CheckoutController : Controller
{
    private readonly ApiClient _apiClient;
    private readonly CartSessionService _cart;

    public CheckoutController(ApiClient apiClient, CartSessionService cart)
    {
        _apiClient = apiClient;
        _cart = cart;
    }

    public IActionResult Index()
    {
        var items = _cart.GetCart();
        if (items.Count == 0)
        {
            TempData["Error"] = "Your cart is empty.";
            return RedirectToAction("Index", "Cart");
        }

        var vm = new CheckoutFormVm
        {
            FullName = User.Identity?.Name ?? string.Empty,
            Email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
            Items = items
        };

        return View(vm);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> PlaceOrder(CheckoutFormVm model)
    {
        var items = _cart.GetCart();
        if (items.Count == 0)
        {
            TempData["Error"] = "Your cart is empty.";
            return RedirectToAction("Index", "Cart");
        }

        if (!ModelState.IsValid)
        {
            model.Items = items;
            return View("Index", model);
        }

        var orderDto = new PlaceOrderVm
        {
            FullName = model.FullName,
            Phone = model.Phone,
            ShippingAddress = model.ShippingAddress,
            PaymentMethod = "Online",
            Items = items.Select(i => new PlaceOrderItemVm { ProductId = i.ProductId, Quantity = i.Quantity }).ToList()
        };

        var (success, error, order) = await _apiClient.PlaceOrderAsync(orderDto);
        if (!success || order is null)
        {
            ModelState.AddModelError(string.Empty, error ?? "Could not place order.");
            model.Items = items;
            return View("Index", model);
        }

        _cart.Clear();
        TempData["Message"] = $"Order #{order.Id} placed successfully!";
        return RedirectToAction("Index", "MyOrders");
    }
}
