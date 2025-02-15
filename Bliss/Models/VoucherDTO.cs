namespace Bliss.Models
{
        // DTO for general voucher data
        public class VoucherDTO
        {
            public int Id { get; set; }
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public int Quantity { get; set; }
            public int Cost { get; set; }
            public int ValidDuration { get; set; }
            public VoucherType VoucherType { get; set; }
            public VoucherStatus Status { get; set; }
            public MemberType MemberType { get; set; }
            // Item Voucher
            public string? ItemName { get; set; }
            public int? ItemQuantity { get; set; }

            // Discount Voucher
            public double? DiscountPercentage { get; set; }
            public double? MaxAmount { get; set; }

            // Gift Card Voucher
            public double? Value { get; set; }
        }

        // DTO for user-specific voucher data
        public class UserVoucherDTO
        {
            public int Id { get; set; }
            public int VoucherId { get; set; }
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string Code { get; set; } = string.Empty;
            public int UserId { get; set; }
            public DateTime ClaimedAt { get; set; }
            public Boolean isValid { get; set; }
            public int Duration { get; set; }
            public VoucherType VoucherType { get; set; }
            // Item Voucher
            public string? ItemName { get; set; }
            public int? ItemQuantity { get; set; }

        // Discount Voucher
            public double? DiscountPercentage { get; set; }
            public double? MaxAmount { get; set; }

        // Gift Card Voucher
            public double? Value { get; set; }
        }
    }
