using System.Security.Claims;
using ECommerceApp.Backend.Data;
using ECommerceApp.Backend.DTOs;
using ECommerceApp.Backend.Models;
using ECommerceApp.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerceApp.Backend.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private static readonly string[] AdminSettableStatuses = { "Open", "Accepted", "Preparation", "OnDelivery", "Cancelled" };

    private readonly AppDbContext _context;
    private readonly EmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(AppDbContext context, EmailService emailService, IConfiguration configuration, ILogger<OrdersController> logger)
    {
        _context = context;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<OrderResponseDto>> PlaceOrder(PlaceOrderDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        if (dto.Items.Count == 0) return BadRequest("Cart is empty.");

        var order = new Order
        {
            UserId = userId,
            CustomerFullName = dto.FullName,
            CustomerPhone = dto.Phone,
            ShippingAddress = dto.ShippingAddress,
            PaymentMethod = "Online",
            Status = "Open",
            OrderDate = DateTime.UtcNow
        };

        var responseItems = new List<OrderItemResponseDto>();
        decimal total = 0;

        foreach (var item in dto.Items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product is null) return BadRequest($"Product {item.ProductId} not found.");
            if (product.Stock < item.Quantity) return BadRequest($"Not enough stock for {product.Name}.");

            product.Stock -= item.Quantity;
            total += product.Price * item.Quantity;

            order.Items.Add(new OrderItem
            {
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = product.Price
            });

            responseItems.Add(new OrderItemResponseDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = item.Quantity,
                UnitPrice = product.Price
            });
        }

        order.TotalAmount = total;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        await SendOrderEmailsAsync(order, responseItems);

        return Ok(new OrderResponseDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            ShippingAddress = order.ShippingAddress,
            CustomerFullName = order.CustomerFullName,
            CustomerPhone = order.CustomerPhone,
            PaymentMethod = order.PaymentMethod,
            Items = responseItems
        });
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetMyOrders()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var orders = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        var unseen = orders.Where(o => !o.IsSeenByCustomer).ToList();
        if (unseen.Count > 0)
        {
            foreach (var order in unseen) order.IsSeenByCustomer = true;
            await _context.SaveChangesAsync();
        }

        var result = orders.Select(o => new OrderResponseDto
        {
            Id = o.Id,
            OrderDate = o.OrderDate,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            ShippingAddress = o.ShippingAddress,
            CustomerFullName = o.CustomerFullName,
            CustomerPhone = o.CustomerPhone,
            PaymentMethod = o.PaymentMethod,
            Items = o.Items.Select(i => new OrderItemResponseDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? string.Empty,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        });

        return Ok(result);
    }

    [HttpGet("unseen-count")]
    public async Task<ActionResult<int>> GetUnseenCount()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var count = await _context.Orders.CountAsync(o => o.UserId == userId && !o.IsSeenByCustomer);
        return Ok(count);
    }

    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<AdminOrderResponseDto>>> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.User)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        var result = orders.Select(o => new AdminOrderResponseDto
        {
            Id = o.Id,
            CustomerName = !string.IsNullOrEmpty(o.CustomerFullName) ? o.CustomerFullName : (o.User?.FullName ?? string.Empty),
            CustomerEmail = o.User?.Email ?? string.Empty,
            CustomerPhone = o.CustomerPhone,
            PaymentMethod = o.PaymentMethod,
            OrderDate = o.OrderDate,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            ShippingAddress = o.ShippingAddress,
            Items = o.Items.Select(i => new OrderItemResponseDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? string.Empty,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        });

        return Ok(result);
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id);
        if (order is null) return NotFound();

        if (order.Status is "Delivered" or "Cancelled")
            return BadRequest($"This order is already {order.Status} and cannot be changed.");

        if (!AdminSettableStatuses.Contains(dto.Status))
            return BadRequest("Invalid status.");

        if (dto.Status == "Open" && order.Status != "Open")
            return BadRequest("An order cannot be moved back to Open once it has been accepted.");

        if (order.Status != dto.Status)
        {
            if (dto.Status == "Cancelled")
            {
                foreach (var item in order.Items)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product is not null) product.Stock += item.Quantity;
                }
            }

            order.Status = dto.Status;
            order.IsSeenByCustomer = false;
            await _context.SaveChangesAsync();
        }

        return Ok(new { order.Id, order.Status });
    }

    [HttpPost("{id:int}/confirm-delivery")]
    public async Task<IActionResult> ConfirmDelivery(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        if (order is null) return NotFound();

        if (order.Status != "OnDelivery") return BadRequest("This order is not out for delivery yet.");

        order.Status = "Delivered";
        order.IsSeenByCustomer = true;
        await _context.SaveChangesAsync();

        return Ok(new { order.Id, order.Status });
    }

    private async Task SendOrderEmailsAsync(Order order, List<OrderItemResponseDto> items)
    {
        try
        {
            var customer = await _context.Users.FindAsync(order.UserId);
            var customerEmail = customer?.Email ?? "unknown";

            var itemsList = string.Join("\n", items.Select(i => $"- {i.ProductName} x {i.Quantity}"));
            var body = $"Order #{order.Id}\n\n" +
                       $"Customer Name: {order.CustomerFullName}\n" +
                       $"Customer Email: {customerEmail}\n" +
                       $"Customer Phone: {order.CustomerPhone}\n\n" +
                       $"Items:\n{itemsList}\n\n" +
                       $"Total: Rs. {order.TotalAmount:N2}\n" +
                       $"Shipping Address: {order.ShippingAddress}\n" +
                       $"Payment Method: {order.PaymentMethod}";

            if (customer?.Email is not null)
            {
                await _emailService.SendEmailAsync(customer.Email, $"Order Confirmation - Order #{order.Id}", body);
            }

            var adminEmail = _configuration["Email:AdminEmail"];
            if (!string.IsNullOrEmpty(adminEmail))
            {
                await _emailService.SendEmailAsync(adminEmail, $"New Order Received - Order #{order.Id}", body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send order emails for order {OrderId}.", order.Id);
        }
    }
}
