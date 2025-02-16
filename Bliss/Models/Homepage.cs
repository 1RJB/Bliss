using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bliss.Models
{
    public class Homepage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int HomepageId { get; set; }

        // New: The name/title of the homepage (e.g., "Toner Page", "Cleanser Page")
        [Required(ErrorMessage = "Name is required.")]
        [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        // Optional: A brief description of the homepage
        [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? Description { get; set; }

        // JSON property to store featured products (if still needed)
        [Required(ErrorMessage = "FeaturedProducts is required.")]
        [MinLength(2, ErrorMessage = "FeaturedProducts must have at least 2 characters.")]
        [MaxLength(1000, ErrorMessage = "FeaturedProducts cannot exceed 1000 characters.")]
        public string FeaturedProducts { get; set; } = "{}"; // Default to empty JSON object

        // JSON property to store banner images
        [Required(ErrorMessage = "BannerImages is required.")]
        [MinLength(2, ErrorMessage = "BannerImages must have at least 2 characters.")]
        [MaxLength(1000, ErrorMessage = "BannerImages cannot exceed 1000 characters.")]
        public string BannerImages { get; set; } = "[]"; // Default to empty JSON array

        // Welcome message limited to 255 characters
        [Required(ErrorMessage = "WelcomeMessage is required.")]
        [MinLength(3, ErrorMessage = "WelcomeMessage must have at least 3 characters.")]
        [MaxLength(255, ErrorMessage = "WelcomeMessage cannot exceed 255 characters.")]
        public string WelcomeMessage { get; set; } = string.Empty;

        // Timestamp for when the homepage record was created
        [Required]
        [Column(TypeName = "datetime")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Timestamp for when the homepage record was last updated
        [Required]
        [Column(TypeName = "datetime")]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation property: a homepage has many products (many-to-many)
        public List<Product> Products { get; set; } = new List<Product>();
    }
}
