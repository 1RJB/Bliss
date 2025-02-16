namespace Bliss.Models
{
        // DTO for general voucher data
        public class VoucherDTO
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string Description { get; set; } 
            public int Quantity { get; set; }
            public int Cost { get; set; }
            public DateTime ValidTill { get; set; }
            public VoucherStatus Status { get; set; }
            public MemberType MemberType { get; set; }
            public string ImageFile { get; set; }
            public decimal Value { get; set; }
    }
    }
