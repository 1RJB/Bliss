using System.ComponentModel.DataAnnotations;

namespace BodyShop_Assign1_2.Models
{
    public class CartItem
    {
        public int Id { get; set; }


        
        [Required]
        public int Quantity { get; set; }

        
        [Required]
        public decimal PriceAtTimeOfAdd { get; set; }

       
        //public decimal Discount { get; set; } = 0;

        // Foreign key for the Cart
        public int CartId { get; set; }

        // Navigation property to represent the many-to-one relationship with Cart
        public Cart? Cart { get; set; }

        // Foreign key for the Product
        public int ProductId { get; set; }

        // Navigation property to represent the many-to-one relationship with Product
        public Product? Product { get; set; }
    }
}
