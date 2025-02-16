using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class AddProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;

        public string? SuitedFor { get; set; } // ✅ New Field
        public string? SkinFeel { get; set; } // ✅ New Field
        public string? KeyIngredients { get; set; } // ✅ New Field
    }

}
