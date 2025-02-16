using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Bliss.Models
{
    public class CreateUserRequest
    {
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(100), JsonIgnore]
        public string Password { get; set; } = string.Empty;

        public string Role { get; set; } = "client";
    }
}
