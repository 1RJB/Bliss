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
            // Explicitly register voucher-related entities per Simon's instructions
            modelBuilder.Entity<User>();
            modelBuilder.Entity<Voucher>();
            modelBuilder.Entity<ItemVoucher>();
            modelBuilder.Entity<DiscountVoucher>();
            modelBuilder.Entity<GiftCardVoucher>();

            // UserVoucher relationships
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

            // One-to-one relationship: User & RewardPoints
            modelBuilder.Entity<User>()
                .HasOne(u => u.RewardPoints)
                .WithOne()
                .HasForeignKey<RewardPoints>(rp => rp.UserId);

            // One-to-many: User & Membership
            modelBuilder.Entity<User>()
                .HasOne(u => u.Membership)
                .WithMany()
                .HasForeignKey(u => u.MembershipId);

            // Seed Membership Data
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
            // Many-to-many: Homepage <--> Product
            // ------------------------------
            modelBuilder.Entity<Homepage>()
                .HasMany(h => h.Products)
                .WithMany(p => p.Homepages)
                .UsingEntity(j => j.ToTable("HomepageProducts"));


            // ------------------------------
            // Many-to-Many: Wishlist <--> Product (New) Elizabeth
            // ------------------------------
            modelBuilder.Entity<Wishlist>()
                .HasMany(w => w.Products)
                .WithMany()
                .UsingEntity(j => j.ToTable("WishlistProducts"));

            // ------------------------------
            // Many-to-many with extra fields: Transaction <--> Product via TransactionItem
            // ------------------------------
            modelBuilder.Entity<TransactionItem>()
                .HasKey(ti => ti.TransactionItemId);

            modelBuilder.Entity<TransactionItem>()
                .HasOne(ti => ti.Transaction)
                .WithMany(t => t.TransactionItems)
                .HasForeignKey(ti => ti.TransactionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TransactionItem>()
                .HasOne(ti => ti.Product)
                .WithMany(p => p.TransactionItems)
                .HasForeignKey(ti => ti.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Other configurations as needed...
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

        // New DbSets for Homepage, Transaction, and TransactionItem
        public DbSet<Homepage> Homepages { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<TransactionItem> TransactionItems { get; set; }

        public DbSet<CartItem> CartItem { get; set; }
    }
}
