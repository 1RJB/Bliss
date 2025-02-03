using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BlissAPI.Models
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

        // Navigation property to represent the one-to-many relationship
        [JsonIgnore]
        public List<Voucher>? Vouchers { get; set; }

        // Navigation property for RewardPoints
        public RewardPoints? RewardPoints { get; set; }

        // Foreign key for Membership
        public int MembershipId { get; set; }
        public Membership? Membership { get; set; }
    }
}
