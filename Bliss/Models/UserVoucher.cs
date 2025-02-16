using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bliss.Models
{
    public class UserVoucher
    {
        [Key]
        public int Id { get; set; }

        // Store key voucher details to prevent data loss
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public VoucherType VoucherType { get; set; }

        // Store additional data from voucher subclasses
        public string? ItemName { get; set; }
        public int? ItemQuantity { get; set; }
        public double? DiscountPercentage { get; set; }
        public double? MaxAmount { get; set; }
        public double? Value { get; set; }

        // Foreign key to the original Voucher (nullable if deleted)
        public int? VoucherId { get; set; }
        public Voucher? Voucher { get; set; }  // Navigation Property

        // Foreign key to the User who claimed the voucher
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        // Unique Code
        [Required]
        [MaxLength(5)] // Increased in case codes get longer in the future
        public string Code { get; set; } = string.Empty;

        // Date when the voucher was claimed
        [Required]
        [Column(TypeName = "datetime")]
        public DateTime ClaimedAt { get; set; } = DateTime.UtcNow;

        // Determines if the voucher is still valid
        [Required]
        public bool isValid { get; set; } = true;

        [Required]
        public int Duration { get; set; }
    }
}
