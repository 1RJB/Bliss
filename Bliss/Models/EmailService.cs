using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Bliss.Models;
using Microsoft.Extensions.Options;

namespace Bliss.Models
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlContent);
    }

    public class EmailService : IEmailService
    {
        private readonly SmtpSettings _smtpSettings;

        public EmailService(IOptions<SmtpSettings> smtpSettings)
        {
            _smtpSettings = smtpSettings.Value;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
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
        }
    }
}
