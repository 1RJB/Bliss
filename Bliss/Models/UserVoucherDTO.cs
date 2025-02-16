using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class UserVoucherDTO
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImageFile { get; set; }
        public DateTime ClaimedAt { get; set; }
        public DateTime ValidTill { get; set; }
        public string code { get; set; }
        public bool isUsed { get; set; } = false;
        public decimal Value { get; set; }
        public int UserId { get; set; }
    }
}
