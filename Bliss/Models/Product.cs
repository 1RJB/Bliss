using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class Product
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string name { get; set; } = string.Empty;

        [Required, MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int Price { get; set; }

        [MaxLength(20)]
        public string? ImageFile { get; set; }

        [Required, MaxLength(50)]
        public string Type { get; set; } = string.Empty; // ✅ Required Type Field

        // Foreign key for User (owner)
        public int UserId { get; set; }
        public User? User { get; set; }

        // Foreign key for Homepage (optional)
        public int? HomepageId { get; set; }
        public Homepage? Homepage { get; set; }
    }
}
