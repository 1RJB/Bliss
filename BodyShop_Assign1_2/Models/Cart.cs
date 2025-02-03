using System.ComponentModel.DataAnnotations;

namespace BodyShop_Assign1_2.Models
{
    public class Cart
    {
        public int Id { get; set; }

       
        [Required]
        public decimal TotalPrice { get; set; }

        [Required]
        public int TotalProducts { get; set; }

        

        // Foreign key for the User
        public int UserId { get; set; }

        // Navigation property to represent the many-to-one relationship
        public User? User { get; set; }
    }
}
