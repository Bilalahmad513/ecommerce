namespace ECommerceApp.Backend.Models;

public class Order
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Open";
    public bool IsSeenByCustomer { get; set; } = true;
    public string ShippingAddress { get; set; } = string.Empty;

    public string CustomerFullName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = "Online";

    public List<OrderItem> Items { get; set; } = new();
}
