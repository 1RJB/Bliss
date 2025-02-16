using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bliss.Models
{
    public class UserVoucher
    {
        [Key]
        public int Id { get; set; }

        [Required, MinLength(3), MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? ImageFile { get; set; }

        public string Code { get; set; }

        public DateTime ClaimedAt { get; set; }

        [Required]
        public DateTime ValidTill { get; set; }

        [Required]
        public bool IsUsed { get; set; } = false;

        [Required]
        public decimal Value { get; set; }

        // Foreign Key to the User who claimed the voucher
        [Required]
        public int UserId { get; set; } 

        // Navigation property to the User
        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}
