using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bliss.Models
{
    public enum VoucherStatus
    {
        Available,
        Redeemed,
        Expired
    }

    public enum MemberType
    {
        Basic,
        Green,
        Premium
    }

    public enum VoucherType
    {
        ItemVoucher,
        DiscountVoucher,
        GiftCardVoucher
    }

    public class Voucher
    {
        [Key]
        public int Id { get; set; }

        [Required, MinLength(3), MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? ImageFile { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public int Cost { get; set; }

        [Required]
        public int ValidDuration { get; set; } // Number of days voucher is valid

        [Required]
        public VoucherStatus Status { get; set; }

        [Required]
        public MemberType MemberType { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public VoucherType VoucherType { get; set; }

    }
}