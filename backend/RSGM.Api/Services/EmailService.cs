using System.Net;
using System.Net.Mail;

namespace RSGM.Api.Services;

public interface IEmailService
{
    Task SendAsync(string recipient, string subject, string message,
        CancellationToken cancellationToken = default, string? replyTo = null);
}

public sealed class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendAsync(string recipient, string subject, string message,
        CancellationToken cancellationToken = default, string? replyTo = null)
    {
        if (!_configuration.GetValue<bool>("Email:Enabled") || string.IsNullOrWhiteSpace(recipient))
            return;

        try
        {
            var host = _configuration["Email:SmtpHost"];
            var sender = _configuration["Email:FromAddress"];
            if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(sender))
            {
                _logger.LogWarning("Email is enabled, but SMTP host or sender address is missing.");
                return;
            }

            using var mail = new MailMessage(sender, recipient, subject, message) { IsBodyHtml = false };
            if (!string.IsNullOrWhiteSpace(replyTo))
                mail.ReplyToList.Add(new MailAddress(replyTo));
            using var client = new SmtpClient(host, _configuration.GetValue("Email:SmtpPort", 587))
            {
                EnableSsl = _configuration.GetValue("Email:UseSsl", true)
            };
            var username = _configuration["Email:Username"];
            var password = _configuration["Email:Password"];
            if (!string.IsNullOrWhiteSpace(username))
                client.Credentials = new NetworkCredential(username, password);

            await client.SendMailAsync(mail, cancellationToken);
        }
        catch (Exception exception)
        {
            // Email is an additional channel. A delivery failure must never roll back the hiring action.
            _logger.LogError(exception, "Unable to send workflow email to {Recipient}.", recipient);
        }
    }
}
