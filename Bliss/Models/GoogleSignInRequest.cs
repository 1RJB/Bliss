using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class GoogleSignInRequest
    {
        [Required]
        public string IdToken { get; set; }
    }
}