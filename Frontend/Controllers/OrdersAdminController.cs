using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

[Route("Admin/Orders")]
public class OrdersAdminController : Controller
{
    [HttpGet("")]
    public IActionResult Index()
    {
        return View();
    }
}
