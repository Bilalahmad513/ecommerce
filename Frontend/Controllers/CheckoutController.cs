using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

public class CheckoutController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
