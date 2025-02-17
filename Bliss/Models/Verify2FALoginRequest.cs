using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class Verify2FALoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(6, MinimumLength = 6)]
        public string Code { get; set; }
    }
}