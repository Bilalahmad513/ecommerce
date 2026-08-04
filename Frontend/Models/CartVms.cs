namespace ECommerceApp.Frontend.Models;

public class CartItemVm
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Total => Price * Quantity;
}

public class CheckoutVm
{
    public List<CartItemVm> Items { get; set; } = new();
    public decimal GrandTotal => Items.Sum(i => i.Total);
}
