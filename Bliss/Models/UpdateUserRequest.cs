using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class UpdateUserRequest
    {
        [Required]
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(50)]
        public string Email { get; set; } = string.Empty;

        public int RewardPoints { get; set; }
    }
}