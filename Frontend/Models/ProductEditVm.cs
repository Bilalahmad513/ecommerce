using System.ComponentModel.DataAnnotations;

namespace ECommerceApp.Frontend.Models;

public class ProductEditVm
{
    public int Id { get; set; }

    [Required, StringLength(150)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Range(0.01, 1000000)]
    public decimal Price { get; set; }

    [Range(0, 1000000)]
    public int Stock { get; set; }

    public string? ImageUrl { get; set; }

    [Required]
    public int CategoryId { get; set; }

    public List<CategoryVm> Categories { get; set; } = new();
}
