using Bliss.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

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
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                // Configure PreviousPasswords as comma-separated string
                entity.Property(u => u.PreviousPasswords)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                    )
                    .Metadata
                    .SetValueComparer(
                        new ValueComparer<List<string>>(
                            (c1, c2) => c1.SequenceEqual(c2),
                            c => c.Aggregate(19, (hash, item) => hash * 31 + (item != null ? item.GetHashCode() : 0)),
                            c => c.ToList()
                        )
                    );

                // Password reset token configurations
                entity.Property(u => u.PasswordResetToken)
                    .IsRequired(false)
                    .HasMaxLength(100); // Add reasonable max length

                entity.Property(u => u.PasswordResetTokenExpiry)
                    .IsRequired(false);

                // Account lockout configurations
                entity.Property(u => u.LoginAttempts)
                    .HasDefaultValue(0)
                    .IsRequired();

                entity.Property(u => u.LockoutEnd)
                    .IsRequired(false);

                entity.Property(u => u.LastPasswordChangeDate)
                    .IsRequired(false);

                // Add index for password reset token for faster lookups
                entity.HasIndex(u => u.PasswordResetToken);

                // Add index for email for faster lookups during login
                entity.HasIndex(u => u.Email)
                    .IsUnique();
            });

            // Seed roles
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Name = "Admin User",
                    Email = "admin@example.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Admin123!"), // Set a secure default password
                    Role = "admin",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    MembershipId = 1,
                    LastPasswordChangeDate = DateTime.UtcNow,
                    PreviousPasswords = new List<string> { BCrypt.Net.BCrypt.HashPassword("Admin123!") }
                },
                new User
                {
                    Id = 2,
                    Name = "Staff User",
                    Email = "staff@example.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Staff123!"),
                    Role = "staff",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    MembershipId = 1,
                    LastPasswordChangeDate = DateTime.UtcNow,
                    PreviousPasswords = new List<string> { BCrypt.Net.BCrypt.HashPassword("Staff123!") }
                },
                new User
                {
                    Id = 3,
                    Name = "Client User",
                    Email = "client@example.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("Client123!"),
                    Role = "client",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    MembershipId = 1,
                    LastPasswordChangeDate = DateTime.UtcNow,
                    PreviousPasswords = new List<string> { BCrypt.Net.BCrypt.HashPassword("Client123!") }
                }
            );

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
                .WithMany(p => p.Wishlists)
                .UsingEntity(j => j.ToTable("WishlistProducts"));

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.ProductSize)
                .WithMany() // or .WithMany(ps => ps.CartItems) if defined in ProductSize
                .HasForeignKey(ci => ci.ProductSizeId)
                .OnDelete(DeleteBehavior.Cascade);

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
        public required DbSet<Membership> Memberships { get; set; }
        public required DbSet<RewardPoints> RewardPoints { get; set; }
        public required DbSet<UserVoucher> UserVouchers { get; set; }

        // New DbSets for Homepage, Transaction, and TransactionItem
        public DbSet<Homepage> Homepages { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<TransactionItem> TransactionItems { get; set; }

        public DbSet<CartItem> CartItem { get; set; }

        public DbSet<ProductSize> ProductSizes { get; set; }

    }
}