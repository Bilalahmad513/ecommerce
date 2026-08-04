using ECommerceApp.Frontend.Models;
using ECommerceApp.Frontend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

[Authorize(Roles = "Admin")]
[Route("Admin/Categories")]
public class CategoriesAdminController : Controller
{
    private readonly ApiClient _apiClient;

    public CategoriesAdminController(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    [HttpGet("")]
    public async Task<IActionResult> Index()
    {
        var categories = await _apiClient.GetCategoriesAsync();
        return View(categories);
    }

    [HttpGet("Create")]
    public IActionResult Create()
    {
        return View(new CategoryEditVm());
    }

    [HttpPost("Create")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CategoryEditVm model)
    {
        if (!ModelState.IsValid) return View(model);

        var (success, error) = await _apiClient.CreateCategoryAsync(model);
        if (!success)
        {
            ModelState.AddModelError(string.Empty, error ?? "Could not create category.");
            return View(model);
        }

        TempData["Message"] = "Category created.";
        return RedirectToAction(nameof(Index));
    }

    [HttpGet("Edit/{id:int}")]
    public async Task<IActionResult> Edit(int id)
    {
        var category = await _apiClient.GetCategoryAsync(id);
        if (category is null) return NotFound();

        var vm = new CategoryEditVm { Id = category.Id, Name = category.Name, Description = category.Description };
        return View(vm);
    }

    [HttpPost("Edit/{id:int}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, CategoryEditVm model)
    {
        if (!ModelState.IsValid) return View(model);

        var (success, error) = await _apiClient.UpdateCategoryAsync(id, model);
        if (!success)
        {
            ModelState.AddModelError(string.Empty, error ?? "Could not update category.");
            return View(model);
        }

        TempData["Message"] = "Category updated.";
        return RedirectToAction(nameof(Index));
    }

    [HttpGet("Delete/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _apiClient.GetCategoryAsync(id);
        if (category is null) return NotFound();

        return View(category);
    }

    [HttpPost("Delete/{id:int}")]
    [ValidateAntiForgeryToken]
    [ActionName("Delete")]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        var (success, error) = await _apiClient.DeleteCategoryAsync(id);
        TempData[success ? "Message" : "Error"] = success ? "Category deleted." : error;
        return RedirectToAction(nameof(Index));
    }
}
