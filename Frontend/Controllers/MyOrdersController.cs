using ECommerceApp.Frontend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

[Authorize]
public class MyOrdersController : Controller
{
    private readonly ApiClient _apiClient;

    public MyOrdersController(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<IActionResult> Index()
    {
        var orders = await _apiClient.GetMyOrdersAsync();
        return View(orders);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ConfirmDelivery(int id)
    {
        var (success, error) = await _apiClient.ConfirmDeliveryAsync(id);
        TempData[success ? "Message" : "Error"] = success ? "Thanks! Order marked as delivered." : error;
        return RedirectToAction(nameof(Index));
    }
}
