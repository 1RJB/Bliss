using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class Verify2FARequest
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Code { get; set; }
    }
}
