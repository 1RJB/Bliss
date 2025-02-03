using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class UpdateProductRequest
    {
        [MinLength(3), MaxLength(100)]
        public string? Name { get; set; }

        [MinLength(3), MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(20)]
        public string? ImageFile { get; set; }
    }
}
