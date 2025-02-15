﻿// <auto-generated />
using System;
using Bliss;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Bliss.Migrations
{
    [DbContext(typeof(MyDbContext))]
    partial class MyDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.12")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("Bliss.Models.ActivityLog", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Action")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("IpAddress")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<double>("Latitude")
                        .HasColumnType("double");

                    b.Property<string>("Location")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<double>("Longitude")
                        .HasColumnType("double");

                    b.Property<DateTime>("Timestamp")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("ActivityLogs");
                });

            modelBuilder.Entity("Bliss.Models.Cart", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<decimal>("TotalPrice")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("TotalProducts")
                        .HasColumnType("int");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("Carts");
                });

            modelBuilder.Entity("Bliss.Models.CartItem", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("CartId")
                        .HasColumnType("int");

                    b.Property<decimal>("PriceAtTimeOfAdd")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("ProductId")
                        .HasColumnType("int");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("CartId");

                    b.HasIndex("ProductId");

                    b.ToTable("CartItems");
                });

            modelBuilder.Entity("Bliss.Models.Homepage", b =>
                {
                    b.Property<int>("HomepageId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("BannerImages")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("varchar(1000)");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime");

                    b.Property<string>("Description")
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<string>("FeaturedProducts")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("varchar(1000)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("datetime");

                    b.Property<string>("WelcomeMessage")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("varchar(255)");

                    b.HasKey("HomepageId");

                    b.ToTable("Homepages");
                });

            modelBuilder.Entity("Bliss.Models.Membership", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Benefits")
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<int>("Cost")
                        .HasColumnType("int");

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("datetime");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("datetime");

                    b.Property<int>("Type")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("Memberships");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Benefits = "Access to basic features",
                            Cost = 0,
                            EndDate = new DateTime(2026, 2, 15, 13, 11, 44, 625, DateTimeKind.Utc).AddTicks(9754),
                            StartDate = new DateTime(2025, 2, 15, 13, 11, 44, 625, DateTimeKind.Utc).AddTicks(9750),
                            Type = 0
                        },
                        new
                        {
                            Id = 2,
                            Benefits = "Access to green features",
                            Cost = 50,
                            EndDate = new DateTime(2026, 2, 15, 13, 11, 44, 625, DateTimeKind.Utc).AddTicks(9762),
                            StartDate = new DateTime(2025, 2, 15, 13, 11, 44, 625, DateTimeKind.Utc).AddTicks(9761),
                            Type = 1
                        },
                        new
                        {
                            Id = 3,
                            Benefits = "Access to all features",
                            Cost = 100,
                            EndDate = new DateTime(2026, 2, 15, 13, 11, 44, 625, DateTimeKind.Utc).AddTicks(9763),
                            StartDate = new DateTime(2025, 2, 15, 13, 11, 44, 625, DateTimeKind.Utc).AddTicks(9763),
                            Type = 2
                        });
                });

            modelBuilder.Entity("Bliss.Models.OtpRecord", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<DateTime>("ExpiresAt")
                        .HasColumnType("datetime(6)");

                    b.Property<string>("Otp")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.ToTable("OtpRecords");
                });

            modelBuilder.Entity("Bliss.Models.Product", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("ImageFile")
                        .HasColumnType("longtext");

                    b.Property<int>("Price")
                        .HasColumnType("int");

                    b.Property<string>("Type")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.Property<string>("name")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("Products");
                });

            modelBuilder.Entity("Bliss.Models.RewardPoints", b =>
                {
                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.Property<int>("Points")
                        .HasColumnType("int");

                    b.Property<DateTime>("ResetDay")
                        .HasColumnType("datetime");

                    b.HasKey("UserId");

                    b.ToTable("RewardPoints");
                });

            modelBuilder.Entity("Bliss.Models.SupportTicket", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int?>("AssignedTo")
                        .HasColumnType("int");

                    b.Property<int>("CreatedBy")
                        .HasColumnType("int");

                    b.Property<string>("Description")
                        .HasMaxLength(1000)
                        .HasColumnType("varchar(1000)");

                    b.Property<DateTime?>("EndDate")
                        .HasColumnType("datetime");

                    b.Property<int>("Priority")
                        .HasColumnType("int");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("datetime");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<int>("Type")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("SupportTickets");
                });

            modelBuilder.Entity("Bliss.Models.Transaction", b =>
                {
                    b.Property<int>("transactionID")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("createdAt")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("transactionDate")
                        .HasColumnType("datetime(6)");

                    b.Property<DateTime>("updatedAt")
                        .HasColumnType("datetime(6)");

                    b.Property<int>("userID")
                        .HasColumnType("int");

                    b.HasKey("transactionID");

                    b.ToTable("Transactions");
                });

            modelBuilder.Entity("Bliss.Models.TransactionItem", b =>
                {
                    b.Property<int>("TransactionItemId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<decimal?>("DiscountApplied")
                        .HasColumnType("decimal(18,2)");

                    b.Property<decimal>("FinalAmount")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int?>("PointsEarned")
                        .HasColumnType("int");

                    b.Property<decimal>("Price")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("ProductId")
                        .HasColumnType("int");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<int?>("RewardsPoints")
                        .HasColumnType("int");

                    b.Property<int>("TransactionId")
                        .HasColumnType("int");

                    b.HasKey("TransactionItemId");

                    b.HasIndex("ProductId");

                    b.HasIndex("TransactionId");

                    b.ToTable("TransactionItems");
                });

            modelBuilder.Entity("Bliss.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<int>("MembershipId")
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("varchar(50)");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("datetime");

                    b.HasKey("Id");

                    b.HasIndex("MembershipId");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Bliss.Models.UserVoucher", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("ClaimedAt")
                        .HasColumnType("datetime");

                    b.Property<string>("Code")
                        .IsRequired()
                        .HasMaxLength(5)
                        .HasColumnType("varchar(5)");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<double?>("DiscountPercentage")
                        .HasColumnType("double");

                    b.Property<int>("Duration")
                        .HasColumnType("int");

                    b.Property<string>("ItemName")
                        .HasColumnType("longtext");

                    b.Property<int?>("ItemQuantity")
                        .HasColumnType("int");

                    b.Property<double?>("MaxAmount")
                        .HasColumnType("double");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.Property<double?>("Value")
                        .HasColumnType("double");

                    b.Property<int?>("VoucherId")
                        .HasColumnType("int");

                    b.Property<int>("VoucherType")
                        .HasColumnType("int");

                    b.Property<bool>("isValid")
                        .HasColumnType("tinyint(1)");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.HasIndex("VoucherId");

                    b.ToTable("UserVouchers");
                });

            modelBuilder.Entity("Bliss.Models.Voucher", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<int>("Cost")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("varchar(500)");

                    b.Property<string>("ImageFile")
                        .HasMaxLength(20)
                        .HasColumnType("varchar(20)");

                    b.Property<string>("MemberType")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<string>("Status")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("datetime");

                    b.Property<int>("ValidDuration")
                        .HasColumnType("int");

                    b.Property<string>("VoucherType")
                        .IsRequired()
                        .HasColumnType("longtext");

                    b.HasKey("Id");

                    b.ToTable("Vouchers");
                });

            modelBuilder.Entity("Bliss.Models.Wishlist", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("varchar(100)");

                    b.Property<DateTime>("UpdatedAt")
                        .HasColumnType("datetime");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("Wishlists");
                });

            modelBuilder.Entity("Chat", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    b.Property<string>("Message")
                        .IsRequired()
                        .HasMaxLength(1000)
                        .HasColumnType("varchar(1000)");

                    b.Property<string>("ResolvedDescription")
                        .HasMaxLength(1000)
                        .HasColumnType("varchar(1000)");

                    b.Property<int>("SendBy")
                        .HasColumnType("int");

                    b.Property<int>("Status")
                        .HasColumnType("int");

                    b.Property<int>("SupportTicketId")
                        .HasColumnType("int");

                    b.Property<DateTime>("TimeStamp")
                        .HasColumnType("datetime");

                    b.HasKey("Id");

                    b.HasIndex("SupportTicketId");

                    b.ToTable("Chats");
                });

            modelBuilder.Entity("HomepageProduct", b =>
                {
                    b.Property<int>("HomepagesHomepageId")
                        .HasColumnType("int");

                    b.Property<int>("ProductsId")
                        .HasColumnType("int");

                    b.HasKey("HomepagesHomepageId", "ProductsId");

                    b.HasIndex("ProductsId");

                    b.ToTable("HomepageProducts", (string)null);
                });

            modelBuilder.Entity("ProductWishlist", b =>
                {
                    b.Property<int>("ProductsId")
                        .HasColumnType("int");

                    b.Property<int>("WishlistsId")
                        .HasColumnType("int");

                    b.HasKey("ProductsId", "WishlistsId");

                    b.HasIndex("WishlistsId");

                    b.ToTable("WishlistProducts", (string)null);
                });

            modelBuilder.Entity("Bliss.Models.ActivityLog", b =>
                {
                    b.HasOne("Bliss.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Bliss.Models.Cart", b =>
                {
                    b.HasOne("Bliss.Models.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Bliss.Models.CartItem", b =>
                {
                    b.HasOne("Bliss.Models.Cart", "Cart")
                        .WithMany()
                        .HasForeignKey("CartId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Bliss.Models.Product", "Product")
                        .WithMany()
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Cart");

                    b.Navigation("Product");
                });

            modelBuilder.Entity("Bliss.Models.Product", b =>
                {
                    b.HasOne("Bliss.Models.User", "User")
                        .WithMany("Products")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Bliss.Models.RewardPoints", b =>
                {
                    b.HasOne("Bliss.Models.User", null)
                        .WithOne("RewardPoints")
                        .HasForeignKey("Bliss.Models.RewardPoints", "UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Bliss.Models.TransactionItem", b =>
                {
                    b.HasOne("Bliss.Models.Product", "Product")
                        .WithMany("TransactionItems")
                        .HasForeignKey("ProductId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Bliss.Models.Transaction", "Transaction")
                        .WithMany("TransactionItems")
                        .HasForeignKey("TransactionId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Product");

                    b.Navigation("Transaction");
                });

            modelBuilder.Entity("Bliss.Models.User", b =>
                {
                    b.HasOne("Bliss.Models.Membership", "Membership")
                        .WithMany()
                        .HasForeignKey("MembershipId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Membership");
                });

            modelBuilder.Entity("Bliss.Models.UserVoucher", b =>
                {
                    b.HasOne("Bliss.Models.User", "User")
                        .WithMany("RedeemedVouchers")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Bliss.Models.Voucher", "Voucher")
                        .WithMany()
                        .HasForeignKey("VoucherId");

                    b.Navigation("User");

                    b.Navigation("Voucher");
                });

            modelBuilder.Entity("Bliss.Models.Wishlist", b =>
                {
                    b.HasOne("Bliss.Models.User", "User")
                        .WithMany("Wishlists")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("Chat", b =>
                {
                    b.HasOne("Bliss.Models.SupportTicket", "SupportTicket")
                        .WithMany()
                        .HasForeignKey("SupportTicketId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("SupportTicket");
                });

            modelBuilder.Entity("HomepageProduct", b =>
                {
                    b.HasOne("Bliss.Models.Homepage", null)
                        .WithMany()
                        .HasForeignKey("HomepagesHomepageId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Bliss.Models.Product", null)
                        .WithMany()
                        .HasForeignKey("ProductsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("ProductWishlist", b =>
                {
                    b.HasOne("Bliss.Models.Product", null)
                        .WithMany()
                        .HasForeignKey("ProductsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Bliss.Models.Wishlist", null)
                        .WithMany()
                        .HasForeignKey("WishlistsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Bliss.Models.Product", b =>
                {
                    b.Navigation("TransactionItems");
                });

            modelBuilder.Entity("Bliss.Models.Transaction", b =>
                {
                    b.Navigation("TransactionItems");
                });

            modelBuilder.Entity("Bliss.Models.User", b =>
                {
                    b.Navigation("Products");

                    b.Navigation("RedeemedVouchers");

                    b.Navigation("RewardPoints");

                    b.Navigation("Wishlists");
                });
#pragma warning restore 612, 618
        }
    }
}
