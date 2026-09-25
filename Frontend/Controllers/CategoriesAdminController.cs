using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

[Route("Admin/Categories")]
public class CategoriesAdminController : Controller
{
    [HttpGet("")]
    public IActionResult Index()
    {
        return View();
    }

    [HttpGet("Create")]
    public IActionResult Create()
    {
        return View();
    }

    [HttpGet("Edit/{id:int}")]
    public IActionResult Edit(int id)
    {
        ViewData["CategoryId"] = id;
        return View();
    }

    [HttpGet("Delete/{id:int}")]
    public IActionResult Delete(int id)
    {
        ViewData["CategoryId"] = id;
        return View();
    }
}
