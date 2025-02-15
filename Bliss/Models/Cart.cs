using System.Collections.Generic;
using System.Linq;

namespace Bliss.Models
{
    public class Cart
    {
        public int Id { get; set; }

        // Associate with a user so they have a persistent cart
        public int UserId { get; set; }
        public User User { get; set; }

        // List of items in the cart
        public List<CartItem> CartItems { get; set; } = new List<CartItem>();

        // Computed property for total price (not stored in DB)
        public int TotalPrice => CartItems.Sum(item => item.Product.Price * item.Quantity);
    }
}
