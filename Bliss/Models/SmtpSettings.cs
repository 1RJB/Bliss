namespace Bliss.Models
{
    public class SmtpSettings
    {
        public required string Server { get; set; }
        public int Port { get; set; }
        public required string SenderEmail { get; set; }
        public required string SenderPassword { get; set; }
        public bool EnableSsl { get; set; }
    }

}
