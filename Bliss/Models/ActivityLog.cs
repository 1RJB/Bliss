using System.Text.Json.Serialization;

namespace Bliss.Models
{
    public class ActivityLog
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string IpAddress { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        [JsonIgnore]
        public User? User { get; set; }
    }
}