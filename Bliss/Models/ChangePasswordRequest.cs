using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class ChangePasswordRequest
    {
        [Required]
        public int Id { get; set; }

        [Required, MinLength(8), MaxLength(50)]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(50)]
        public string NewPassword { get; set; } = string.Empty;
    }
}