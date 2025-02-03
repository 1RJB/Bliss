using System.ComponentModel.DataAnnotations;

namespace BlissAPI.Models
{
    public class UpdateVoucherRequest
    {
        [MinLength(3), MaxLength(100)]
        public string? Title { get; set; }

        [MinLength(3), MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(20)]
        public string? ImageFile { get; set; }

        public VoucherStatus? Status { get; set; } // Allow updating the status

        public int? Cost { get; set; } // Allow updating the cost

        public int? ValidDuration { get; set; } // Allow updating the valid duration

        public int? Quantity { get; set; } // Allow updating the quantity

        public MemberType? MemberType { get; set; } // Allow updating the member type

        public VoucherType? VoucherType { get; set; } // Allow updating the voucher type

        // Additional properties for specific voucher types
        public string? ItemName { get; set; }
        public int? ItemQuantity { get; set; }
        public double? DiscountPercentage { get; set; }
        public double? MaxAmount { get; set; }
        public double? Value { get; set; }
    }
}
