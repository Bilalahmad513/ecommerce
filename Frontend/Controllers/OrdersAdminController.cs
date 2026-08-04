using ECommerceApp.Frontend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

[Authorize(Roles = "Admin")]
[Route("Admin/Orders")]
public class OrdersAdminController : Controller
{
    private readonly ApiClient _apiClient;

    public OrdersAdminController(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    [HttpGet("")]
    public async Task<IActionResult> Index()
    {
        var orders = await _apiClient.GetAllOrdersAsync();
        return View(orders);
    }

    [HttpPost("UpdateStatus/{id:int}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateStatus(int id, string status)
    {
        var (success, error) = await _apiClient.UpdateOrderStatusAsync(id, status);
        TempData[success ? "Message" : "Error"] = success ? "Order status updated." : error;
        return RedirectToAction(nameof(Index));
    }
}
