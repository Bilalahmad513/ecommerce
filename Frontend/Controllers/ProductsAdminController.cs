using ECommerceApp.Frontend.Models;
using ECommerceApp.Frontend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Controllers;

[Authorize(Roles = "Admin")]
[Route("Admin/Products")]
public class ProductsAdminController : Controller
{
    private readonly ApiClient _apiClient;

    public ProductsAdminController(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    [HttpGet("")]
    public async Task<IActionResult> Index()
    {
        var products = await _apiClient.GetProductsAsync();
        return View(products);
    }

    [HttpGet("Create")]
    public async Task<IActionResult> Create()
    {
        var vm = new ProductEditVm { Stock = 100, Categories = await _apiClient.GetCategoriesAsync() };
        return View(vm);
    }

    [HttpPost("Create")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(ProductEditVm model)
    {
        if (!ModelState.IsValid)
        {
            model.Categories = await _apiClient.GetCategoriesAsync();
            return View(model);
        }

        var (success, error) = await _apiClient.CreateProductAsync(model);
        if (!success)
        {
            ModelState.AddModelError(string.Empty, error ?? "Could not create product.");
            model.Categories = await _apiClient.GetCategoriesAsync();
            return View(model);
        }

        TempData["Message"] = "Product created.";
        return RedirectToAction(nameof(Index));
    }

    [HttpGet("Edit/{id:int}")]
    public async Task<IActionResult> Edit(int id)
    {
        var product = await _apiClient.GetProductAsync(id);
        if (product is null) return NotFound();

        var vm = new ProductEditVm
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            ImageUrl = product.ImageUrl,
            CategoryId = product.CategoryId,
            Categories = await _apiClient.GetCategoriesAsync()
        };

        return View(vm);
    }

    [HttpPost("Edit/{id:int}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, ProductEditVm model)
    {
        if (!ModelState.IsValid)
        {
            model.Categories = await _apiClient.GetCategoriesAsync();
            return View(model);
        }

        var (success, error) = await _apiClient.UpdateProductAsync(id, model);
        if (!success)
        {
            ModelState.AddModelError(string.Empty, error ?? "Could not update product.");
            model.Categories = await _apiClient.GetCategoriesAsync();
            return View(model);
        }

        TempData["Message"] = "Product updated.";
        return RedirectToAction(nameof(Index));
    }

    [HttpGet("Delete/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _apiClient.GetProductAsync(id);
        if (product is null) return NotFound();

        return View(product);
    }

    [HttpPost("Delete/{id:int}")]
    [ValidateAntiForgeryToken]
    [ActionName("Delete")]
    public async Task<IActionResult> DeleteConfirmed(int id)
    {
        await _apiClient.DeleteProductAsync(id);
        TempData["Message"] = "Product deleted.";
        return RedirectToAction(nameof(Index));
    }
}
