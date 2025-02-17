using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace Bliss.Models
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlContent);
    }

    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _smtpSettings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<SmtpSettings> smtpSettings, ILogger<EmailService> logger)
        {
            _smtpSettings = smtpSettings.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
        {
            try
            {
                using (var message = new MailMessage())
                {
                    message.From = new MailAddress(_smtpSettings.SenderEmail);
                    message.To.Add(new MailAddress(toEmail));
                    message.Subject = subject;
                    message.Body = htmlContent;
                    message.IsBodyHtml = true;

                    using (var client = new SmtpClient(_smtpSettings.Server, _smtpSettings.Port))
                    {
                        client.Credentials = new NetworkCredential(_smtpSettings.SenderEmail, _smtpSettings.SenderPassword);
                        client.EnableSsl = _smtpSettings.EnableSsl;
                        await client.SendMailAsync(message);
                    }
                }
                _logger.LogInformation("Email sent successfully to {toEmail}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {toEmail}", toEmail);
                throw;
            }
        }
    }
}
