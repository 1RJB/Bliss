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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public int Cost { get; set; }

        [Required]
        public DateTime ValidTill { get; set; }

        [Required]
        public VoucherStatus Status { get; set; } = VoucherStatus.Available;

        [Required]
        public int Quantity { get; set; }

        [Required]
        public decimal Value { get; set; }
    }
}