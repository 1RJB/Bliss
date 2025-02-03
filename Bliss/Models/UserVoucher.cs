using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bliss.Models
{
    public class UserVoucher
    {
        [Key]
        public int Id { get; set; }

        // ✅ Foreign key for User
        [Required]
        public int UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; } = null!;

        // ✅ Foreign key for Voucher
        [Required]
        public int VoucherId { get; set; }

        [ForeignKey(nameof(VoucherId))]
        public Voucher Voucher { get; set; } = null!;

        // ✅ Automatically sets the current timestamp when redeemed
        [Column(TypeName = "datetime")]
        public DateTime RedeemedAt { get; set; } = DateTime.UtcNow;
    }
}
