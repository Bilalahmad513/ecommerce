using System.ComponentModel.DataAnnotations;

namespace ECommerceApp.Backend.DTOs;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class CategoryCreateDto
{
    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public class CategoryUpdateDto : CategoryCreateDto
{
}
