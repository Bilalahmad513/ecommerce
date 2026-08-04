using System.Text.Json;
using ECommerceApp.Frontend.Models;

namespace ECommerceApp.Frontend.Services;

public class CartSessionService
{
    private const string SessionKey = "Cart";
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CartSessionService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ISession Session => _httpContextAccessor.HttpContext!.Session;

    public List<CartItemVm> GetCart()
    {
        var json = Session.GetString(SessionKey);
        return json is null ? new List<CartItemVm>() : JsonSerializer.Deserialize<List<CartItemVm>>(json) ?? new();
    }

    private void SaveCart(List<CartItemVm> cart)
    {
        Session.SetString(SessionKey, JsonSerializer.Serialize(cart));
    }

    public void AddItem(ProductVm product, int quantity)
    {
        var cart = GetCart();
        var existing = cart.FirstOrDefault(i => i.ProductId == product.Id);
        if (existing is not null)
        {
            existing.Quantity += quantity;
        }
        else
        {
            cart.Add(new CartItemVm { ProductId = product.Id, Name = product.Name, Price = product.Price, Quantity = quantity });
        }

        SaveCart(cart);
    }

    public void UpdateQuantity(int productId, int quantity)
    {
        var cart = GetCart();
        var item = cart.FirstOrDefault(i => i.ProductId == productId);
        if (item is null) return;

        if (quantity <= 0)
            cart.Remove(item);
        else
            item.Quantity = quantity;

        SaveCart(cart);
    }

    public void RemoveItem(int productId)
    {
        var cart = GetCart();
        cart.RemoveAll(i => i.ProductId == productId);
        SaveCart(cart);
    }

    public void Clear()
    {
        Session.Remove(SessionKey);
    }
}
