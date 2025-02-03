using BlissAPI.Models;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Bliss.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(100), JsonIgnore]
        public string Password { get; set; } = string.Empty;

        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public RewardPoints? RewardPoints { get; set; }

        [Required]
        public int MembershipId { get; set; }

        public Membership? Membership { get; set; }

        public List<UserVoucher>? RedeemedVouchers { get; set; } = new();

        [JsonIgnore]
        public List<Product>? Products { get; set; } 

        [JsonIgnore]
        public List<Wishlist>? Wishlists { get; set; }
    }
}
