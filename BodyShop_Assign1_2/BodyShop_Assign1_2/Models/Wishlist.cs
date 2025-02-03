using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace BodyShop_Assign1_2.Models
{
    public class Wishlist
    {
        public int Id { get; set; }

        [Required, MinLength(3), MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(100)]
        public string Description { get; set;  } = string.Empty;

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; }

        // Foreign key for the User
        public int UserId { get; set; }

        // Navigation property to represent the one-to-many relationship
        public User? User { get; set; }

        //// Foreign key for the Product
        //public int ProductId { get; set; }
        //public Product Product { get; set; }
    }
}
