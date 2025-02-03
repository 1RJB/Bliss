namespace BlissAPI.Models
{
    public class VoucherDTO
    {
        public int Id { get; set; }
        public string? Code { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string? ImageFile { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public int Cost { get; set; }

        public int ValidDuration { get; set; }

        public int Quantity { get; set; }

        public VoucherStatus Status { get; set; }

        public MemberType MemberType { get; set; }

        public VoucherType VoucherType { get; set; }

        public int UserId { get; set; }

        public int ClaimedBy { get; set; }

        public UserBasicDTO? User { get; set; }

        // **NEW: Extra fields based on voucher type**

        // Item Voucher
        public string? ItemName { get; set; }
        public int? ItemQuantity { get; set; }

        // Discount Voucher
        public int? DiscountPercentage { get; set; }
        public int? MaxAmount { get; set; }

        // Gift Card Voucher
        public int? Value { get; set; }
    }
}
