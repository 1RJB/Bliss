using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class AddProductRequest
    {
        [Required, MinLength(3), MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? ImageFile { get; set; }
    }
}
