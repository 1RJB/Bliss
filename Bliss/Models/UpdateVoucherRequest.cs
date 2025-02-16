using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class UpdateVoucherRequest
    {
        [Required, MinLength(3), MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? ImageFile { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public int Cost { get; set; }

        [Required]
        public DateTime ValidTill { get; set; }

        [Required]
        public VoucherStatus Status { get; set; } = VoucherStatus.Available;

        [Required]
        public MemberType MemberType { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public decimal Value { get; set; }
    }
}
