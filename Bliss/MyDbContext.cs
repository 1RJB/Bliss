using Bliss.Models;
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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ✅ Define UserVoucher Relationship
            modelBuilder.Entity<UserVoucher>()
                .HasKey(uv => new { uv.UserId, uv.VoucherId });

            modelBuilder.Entity<UserVoucher>()
                .HasOne(uv => uv.User)
                .WithMany(u => u.RedeemedVouchers)
                .HasForeignKey(uv => uv.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserVoucher>()
                .HasOne(uv => uv.Voucher)
                .WithMany(v => v.RedeemedByUsers)
                .HasForeignKey(uv => uv.VoucherId)
                .OnDelete(DeleteBehavior.Cascade);

            // ✅ Configure One-to-One Relationship (User & RewardPoints)
            modelBuilder.Entity<User>()
                .HasOne(u => u.RewardPoints)
                .WithOne()
                .HasForeignKey<RewardPoints>(rp => rp.UserId);

            // ✅ Configure One-to-Many Relationship (User & Membership)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Membership)
                .WithMany()
                .HasForeignKey(u => u.MembershipId);

            // ✅ Seed Membership Data
            modelBuilder.Entity<Membership>().HasData(
                new Membership
                {
                    Id = 1,
                    Type = MemberType.Basic,
                    Benefits = "Access to basic features",
                    Cost = 0,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddYears(1)
                },
                new Membership
                {
                    Id = 2,
                    Type = MemberType.Green,
                    Benefits = "Access to green features",
                    Cost = 50,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddYears(1)
                },
                new Membership
                {
                    Id = 3,
                    Type = MemberType.Premium,
                    Benefits = "Access to all features",
                    Cost = 100,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddYears(1)
                }
            );

            // ------------------------------
            // New Configurations for Homepage & Transaction
            // ------------------------------

            // Configure one-to-many relationship: Homepage <--> Product
            // Assumes Product has a nullable HomepageId property and a navigation property "Homepage"
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Homepage)
                .WithMany(h => h.Products)
                .HasForeignKey(p => p.HomepageId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure Transaction relationships:
            // Link Transaction.userID to User (without a navigation property on Transaction)
            modelBuilder.Entity<Transaction>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(t => t.userID)
                .OnDelete(DeleteBehavior.Cascade);

            // Link Transaction.productID to Product (without a navigation property on Transaction)
            modelBuilder.Entity<Transaction>()
                .HasOne<Product>()
                .WithMany()
                .HasForeignKey(t => t.productID)
                .OnDelete(DeleteBehavior.Cascade);

            // Explicitly register all voucher-related entities per Simon's instructions
            modelBuilder.Entity<User>();
            modelBuilder.Entity<Voucher>();
            modelBuilder.Entity<ItemVoucher>();
            modelBuilder.Entity<DiscountVoucher>();
            modelBuilder.Entity<GiftCardVoucher>();
        }

        // Existing DbSets
        public required DbSet<Product> Products { get; set; }
        public required DbSet<User> Users { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<OtpRecord> OtpRecords { get; set; }
        public required DbSet<Cart> Carts { get; set; }
        public required DbSet<CartItem> CartItems { get; set; }
        public required DbSet<Wishlist> Wishlists { get; set; }
        public required DbSet<Voucher> Vouchers { get; set; }
        public required DbSet<SupportTicket> SupportTickets { get; set; }
        public required DbSet<Chat> Chats { get; set; }
        public required DbSet<Membership> Memberships { get; set; }
        public required DbSet<RewardPoints> RewardPoints { get; set; }
        public required DbSet<UserVoucher> UserVouchers { get; set; }

        // New DbSets for Homepage and Transaction
        public DbSet<Homepage> Homepages { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
    }
}
