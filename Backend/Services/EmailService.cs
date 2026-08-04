using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace ECommerceApp.Backend.Services;

public class EmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var senderEmail = _configuration["Email:SenderEmail"];
        var senderPassword = _configuration["Email:SenderPassword"];

        if (string.IsNullOrEmpty(senderEmail) || string.IsNullOrEmpty(senderPassword))
        {
            _logger.LogWarning("Email is not configured (missing SenderEmail/SenderPassword) - skipping send to {ToEmail}.", toEmail);
            return;
        }

        var senderName = _configuration["Email:SenderName"] ?? "ECommerceApp";
        var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
        var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, senderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        using var client = new SmtpClient();
        await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(senderEmail, senderPassword);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
