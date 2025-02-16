using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Bliss.Models
{
    public class ProductSize
    {
        public int Id { get; set; }
        public int ProductId { get; set; }

        [JsonIgnore] // ✅ Prevents circular reference
        public Product? Product { get; set; }

        [Required, MaxLength(50)]
        public string Size { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }
    }
}
