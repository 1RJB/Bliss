using BlissAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BlissAPI
{
    public class MyDbContext : DbContext
    {
        private readonly IConfiguration _configuration;

        public MyDbContext(IConfiguration configuration)
        {
            _configuration = configuration;
        }

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
            modelBuilder.Entity<ItemVoucher>();
            modelBuilder.Entity<DiscountVoucher>();
            modelBuilder.Entity<GiftCardVoucher>();

            // Seed Membership data
            modelBuilder.Entity<Membership>().HasData(
                new Membership
                {
                    Id = 1,
                    Type = MemberType.Basic,
                    Benefits = "Access to basic features",
                    Cost = 0,
                    StartDate = DateTime.Now,
                    EndDate = DateTime.Now.AddYears(1)
                },
                new Membership
                {
                    Id = 2,
                    Type = MemberType.Green,
                    Benefits = "Access to green features",
                    Cost = 50,
                    StartDate = DateTime.Now,
                    EndDate = DateTime.Now.AddYears(1)
                },
                new Membership
                {
                    Id = 3,
                    Type = MemberType.Premium,
                    Benefits = "Access to all features",
                    Cost = 100,
                    StartDate = DateTime.Now,
                    EndDate = DateTime.Now.AddYears(1)
                }
            );

            // Configure one-to-one relationship between User and RewardPoints
            modelBuilder.Entity<User>()
                .HasOne(u => u.RewardPoints)
                .WithOne()
                .HasForeignKey<RewardPoints>(rp => rp.UserId);

            // Configure one-to-many relationship between User and Membership
            modelBuilder.Entity<User>()
                .HasOne(u => u.Membership)
                .WithMany()
                .HasForeignKey(u => u.MembershipId);
        }

        public required DbSet<Voucher> Vouchers { get; set; }
        public required DbSet<User> Users { get; set; }
        public required DbSet<SupportTicket> SupportTickets { get; set; }
        public required DbSet<Chat> Chats { get; set; }
        public required DbSet<Membership> Memberships { get; set; }
        public required DbSet<RewardPoints> RewardPoints { get; set; }
    }
}
