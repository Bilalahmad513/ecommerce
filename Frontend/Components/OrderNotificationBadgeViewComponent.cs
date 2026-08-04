using ECommerceApp.Frontend.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECommerceApp.Frontend.Components;

public class OrderNotificationBadgeViewComponent : ViewComponent
{
    private readonly ApiClient _apiClient;

    public OrderNotificationBadgeViewComponent(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<IViewComponentResult> InvokeAsync()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return Content(string.Empty);
        }

        var count = await _apiClient.GetUnseenOrderCountAsync();
        return View(count);
    }
}
