using System.ComponentModel.DataAnnotations;

namespace BlissAPI.Models
{
    public class ItemVoucher : Voucher
    {
        [Required]
        public string? ItemName { get; set; }
        [Required]
        public int ItemQuantity { get; set; }
    }

    public class DiscountVoucher : Voucher
    {
        [Required]
        public double DiscountPercentage { get; set; }
        [Required]
        public double MaxAmount { get; set; }
    }

    public class GiftCardVoucher : Voucher
    {
        [Required]
        public double Value { get; set; }
    }
}
