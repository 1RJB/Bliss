using System.ComponentModel.DataAnnotations;    
namespace BodyShop_Assign1_2.Models
{
    public class RegisterRequest
    {
        [Required, MinLength(3), MaxLength(50)]
        // Regular expression to enforce name format
        [RegularExpression(@"^[a-zA-Z '-,.]+$",ErrorMessage = "Only allow letters, spaces and characters: ' - , .")]
        public string Name { get; set; } = string.Empty;
        [Required,EmailAddress, MaxLength(50)]
        // Regular expression to enforce password complexity
        [RegularExpression(@"^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$",ErrorMessage = "At least 1 letter and 1 number")]
        public string Email { get; set; } = string.Empty;
        [Required, MinLength(8), MaxLength(20)]
        public string Password { get; set; } = string.Empty;    

    }
}
