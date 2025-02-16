using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Bliss.Models
{
    public class CartItem
    {
        public int Id { get; set; }

        // Foreign keys
        public int CartId { get; set; }

        [JsonIgnore] // This prevents serializing the parent Cart and breaking the cycle
        public Cart Cart { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; }

        public int ProductSizeId { get; set; }
        // Optionally, a navigation property:
        [JsonIgnore]
        public ProductSize ProductSize { get; set; }


        // Track how many of this product the cart contains
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; } = 1;


    }
}

