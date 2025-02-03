namespace Bliss.Models
{
    public class ActivityLogDTO
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}