using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class Product
    {
        public int Id { get; set; }

        // Example properties (adjust as needed)
        public string name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Price { get; set; }
        public string? ImageFile { get; set; }

        [Required, MaxLength(50)]
        public string Type { get; set; } = string.Empty; // ✅ Required Type Field

        // Foreign key for User (owner)
        public int UserId { get; set; }
        public User? User { get; set; }

        // Navigation property for many-to-many with Homepages
        public List<Homepage> Homepages { get; set; } = new List<Homepage>();

        // Navigation property for many-to-many with Transactions via TransactionItems
        public List<TransactionItem> TransactionItems { get; set; } = new List<TransactionItem>();

        public List<Wishlist> Wishlists { get; set; } = new();

        // ✅ New field to store different product sizes and their prices
        public List<ProductSize> Sizes { get; set; } = new();
    }
}
