using System.ComponentModel.DataAnnotations;

namespace ECommerceApp.Frontend.Models;

public class CheckoutFormVm
{
    [Required, Display(Name = "Full Name")]
    public string FullName { get; set; } = string.Empty;

    [Display(Name = "Email Address")]
    public string Email { get; set; } = string.Empty;

    [Required, Phone, Display(Name = "Phone Number")]
    public string Phone { get; set; } = string.Empty;

    [Required, Display(Name = "Shipping Address")]
    public string ShippingAddress { get; set; } = string.Empty;

    public string PaymentMethod { get; set; } = "Online";

    public List<CartItemVm> Items { get; set; } = new();

    public decimal GrandTotal => Items.Sum(i => i.Total);
}
