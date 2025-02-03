using Bliss.Models;
using BlissAPI.Models;
using Microsoft.EntityFrameworkCore;
using System;

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
            modelBuilder.Entity<User>();
            modelBuilder.Entity<Voucher>();
            modelBuilder.Entity<ItemVoucher>();
            modelBuilder.Entity<DiscountVoucher>();
            modelBuilder.Entity<GiftCardVoucher>();

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

            modelBuilder.Entity<User>()
                .HasOne(u => u.RewardPoints)
                .WithOne()
                .HasForeignKey<RewardPoints>(rp => rp.UserId);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Membership)
                .WithMany()
                .HasForeignKey(u => u.MembershipId);
        }

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
    }
}
