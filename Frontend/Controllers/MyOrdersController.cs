using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

public class MyOrdersController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
