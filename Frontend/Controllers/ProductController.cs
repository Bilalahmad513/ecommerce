using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

public class ProductController : Controller
{
    public IActionResult Details(int id)
    {
        ViewData["ProductId"] = id;
        return View();
    }
}
