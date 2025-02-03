using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class AddVoucherRequest
    {
        [Required, MinLength(3), MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? ImageFile { get; set; }

        [Required]
        public int Cost { get; set; }

        [Required]
        public int ValidDuration { get; set; } 

        [Required]
        public VoucherStatus Status { get; set; } = VoucherStatus.Available;

        [Required]
        public MemberType MemberType { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public VoucherType VoucherType { get; set; }

        public string? ItemName { get; set; }
        public int? ItemQuantity { get; set; }
        public double? DiscountPercentage { get; set; }
        public double? MaxAmount { get; set; }
        public double? Value { get; set; }

        public int? UserId { get; set; }
    }
}
