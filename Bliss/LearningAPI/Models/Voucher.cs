using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace BlissAPI.Models
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

    public abstract class Voucher
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(5)]
        public string? Code { get; set; }

        [Required, MinLength(3), MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? ImageFile { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; }

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

        public int UserId { get; set; }

        public User? User { get; set; }

        public int? ClaimedBy { get; set; }

        public void GenerateAndSetCode()
        {
            if (ClaimedBy.HasValue && string.IsNullOrEmpty(Code))
            {
                Code = GenerateCode();
            }
        }

        private static string GenerateCode()
        {
            var random = new Random();
            const string letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string digits = "0123456789";
            return new string(Enumerable.Repeat(letters, 3).Select(s => s[random.Next(s.Length)]).ToArray()) +
                   new string(Enumerable.Repeat(digits, 2).Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
