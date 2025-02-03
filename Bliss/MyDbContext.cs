﻿using Bliss.Models;
using Microsoft.EntityFrameworkCore;

namespace Bliss
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

        public DbSet<ActivityLog> ActivityLogs { get; set; }

        public DbSet<OtpRecord> OtpRecords { get; set; }

        public required DbSet<Cart> Carts { get; set; }

        public required DbSet<CartItem> CartItems { get; set; }

        public required DbSet<Wishlist> Wishlists { get; set; }
    }
}