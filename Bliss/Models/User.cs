using Bliss.Models;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Bliss.Models
{
    public class User
    {
        public int Id { get; set; }

        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(100), JsonIgnore]
        public string Password { get; set; } = string.Empty;

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; }

        public RewardPoints? RewardPoints { get; set; }

        public int MembershipId { get; set; }

        public Membership? Membership { get; set; }

        // navigation  to represent 1-many rs
        [JsonIgnore]
        public List<Product>? Products { get; set; }

        //one user has many wishlists
        [JsonIgnore]
        public List<Wishlist>? Wishlists { get; set; }
        public List<UserVoucher>? RedeemedVouchers { get; set; } = new();
    }
}