using BodyShop_Assign1_2.Models;
using Microsoft.EntityFrameworkCore;

namespace BodyShop_Assign1_2
{
    public class MyDbContext(IConfiguration configuration) : DbContext
    {
        private readonly IConfiguration _configuration = configuration;
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            string? connectionString = _configuration.GetConnectionString("MyConnection");
            if (connectionString != null) 
            { 
                optionsBuilder.UseMySQL(connectionString);
            }
        }

        public required DbSet<Product> Products { get; set; }
        public required DbSet<User> Users { get; set; }

        public required DbSet<Cart> Carts { get; set; }
        public required DbSet<CartItem> CartItems { get; set; }

        public required DbSet<Wishlist> Wishlists { get; set; }
    }
}
