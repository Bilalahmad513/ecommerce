using System.Net.Http.Headers;
using System.Net.Http.Json;
using ECommerceApp.Frontend.Models;

namespace ECommerceApp.Frontend.Services;

public class ApiClient
{
    private readonly HttpClient _httpClient;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ApiClient(HttpClient httpClient, IHttpContextAccessor httpContextAccessor)
    {
        _httpClient = httpClient;
        _httpContextAccessor = httpContextAccessor;
    }

    private void AttachToken()
    {
        var token = _httpContextAccessor.HttpContext?.User.FindFirst("jwt")?.Value;
        _httpClient.DefaultRequestHeaders.Authorization = token is null
            ? null
            : new AuthenticationHeaderValue("Bearer", token);
    }

    public async Task<List<ProductVm>> GetProductsAsync(int? categoryId = null)
    {
        var url = categoryId.HasValue ? $"api/products?categoryId={categoryId}" : "api/products";
        return await _httpClient.GetFromJsonAsync<List<ProductVm>>(url) ?? new();
    }

    public async Task<ProductVm?> GetProductAsync(int id)
    {
        var response = await _httpClient.GetAsync($"api/products/{id}");
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<ProductVm>();
    }

    public async Task<List<CategoryVm>> GetCategoriesAsync()
    {
        return await _httpClient.GetFromJsonAsync<List<CategoryVm>>("api/categories") ?? new();
    }

    public async Task<CategoryVm?> GetCategoryAsync(int id)
    {
        var response = await _httpClient.GetAsync($"api/categories/{id}");
        if (!response.IsSuccessStatusCode) return null;
        return await response.Content.ReadFromJsonAsync<CategoryVm>();
    }

    public async Task<(bool Success, string? Error)> CreateCategoryAsync(CategoryEditVm dto)
    {
        AttachToken();
        var response = await _httpClient.PostAsJsonAsync("api/categories", dto);
        return response.IsSuccessStatusCode ? (true, null) : (false, await response.Content.ReadAsStringAsync());
    }

    public async Task<(bool Success, string? Error)> UpdateCategoryAsync(int id, CategoryEditVm dto)
    {
        AttachToken();
        var response = await _httpClient.PutAsJsonAsync($"api/categories/{id}", dto);
        return response.IsSuccessStatusCode ? (true, null) : (false, await response.Content.ReadAsStringAsync());
    }

    public async Task<(bool Success, string? Error)> DeleteCategoryAsync(int id)
    {
        AttachToken();
        var response = await _httpClient.DeleteAsync($"api/categories/{id}");
        return response.IsSuccessStatusCode ? (true, null) : (false, await response.Content.ReadAsStringAsync());
    }

    public async Task<(bool Success, string? Error)> CreateProductAsync(ProductEditVm dto)
    {
        AttachToken();
        var response = await _httpClient.PostAsJsonAsync("api/products", dto);
        return response.IsSuccessStatusCode ? (true, null) : (false, await response.Content.ReadAsStringAsync());
    }

    public async Task<(bool Success, string? Error)> UpdateProductAsync(int id, ProductEditVm dto)
    {
        AttachToken();
        var response = await _httpClient.PutAsJsonAsync($"api/products/{id}", dto);
        return response.IsSuccessStatusCode ? (true, null) : (false, await response.Content.ReadAsStringAsync());
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        AttachToken();
        var response = await _httpClient.DeleteAsync($"api/products/{id}");
        return response.IsSuccessStatusCode;
    }

    public async Task<(bool Success, string? Error, AuthResultVm? Result)> RegisterAsync(RegisterVm dto)
    {
        var response = await _httpClient.PostAsJsonAsync("api/account/register", dto);
        if (!response.IsSuccessStatusCode)
            return (false, await response.Content.ReadAsStringAsync(), null);

        var result = await response.Content.ReadFromJsonAsync<AuthResultVm>();
        return (true, null, result);
    }

    public async Task<(bool Success, string? Error, AuthResultVm? Result)> LoginAsync(LoginVm dto)
    {
        var response = await _httpClient.PostAsJsonAsync("api/account/login", dto);
        if (!response.IsSuccessStatusCode)
            return (false, await response.Content.ReadAsStringAsync(), null);

        var result = await response.Content.ReadFromJsonAsync<AuthResultVm>();
        return (true, null, result);
    }

    public async Task<(bool Success, string? Error, OrderVm? Order)> PlaceOrderAsync(PlaceOrderVm dto)
    {
        AttachToken();
        var response = await _httpClient.PostAsJsonAsync("api/orders", dto);
        if (!response.IsSuccessStatusCode)
            return (false, await response.Content.ReadAsStringAsync(), null);

        var order = await response.Content.ReadFromJsonAsync<OrderVm>();
        return (true, null, order);
    }

    public async Task<List<OrderVm>> GetMyOrdersAsync()
    {
        AttachToken();
        return await _httpClient.GetFromJsonAsync<List<OrderVm>>("api/orders") ?? new();
    }

    public async Task<int> GetUnseenOrderCountAsync()
    {
        AttachToken();
        var response = await _httpClient.GetAsync("api/orders/unseen-count");
        if (!response.IsSuccessStatusCode) return 0;
        return await response.Content.ReadFromJsonAsync<int>();
    }

    public async Task<List<AdminOrderVm>> GetAllOrdersAsync()
    {
        AttachToken();
        return await _httpClient.GetFromJsonAsync<List<AdminOrderVm>>("api/orders/all") ?? new();
    }

    public async Task<(bool Success, string? Error)> UpdateOrderStatusAsync(int id, string status)
    {
        AttachToken();
        var response = await _httpClient.PutAsJsonAsync($"api/orders/{id}/status", new { status });
        return response.IsSuccessStatusCode ? (true, null) : (false, await response.Content.ReadAsStringAsync());
    }

    public async Task<(bool Success, string? Error)> ConfirmDeliveryAsync(int id)
    {
        AttachToken();
        var response = await _httpClient.PostAsync($"api/orders/{id}/confirm-delivery", null);
        return response.IsSuccessStatusCode ? (true, null) : (false, await response.Content.ReadAsStringAsync());
    }
}
