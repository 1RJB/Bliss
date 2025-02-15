using System.ComponentModel.DataAnnotations;

namespace Bliss.Models
{
    public class HomepageCreateDto
    {
        [Required(ErrorMessage = "FeaturedProducts is required.")]
        [MinLength(2, ErrorMessage = "FeaturedProducts must have at least 2 characters.")]
        [MaxLength(1000, ErrorMessage = "FeaturedProducts cannot exceed 1000 characters.")]
        public string FeaturedProducts { get; set; } = "{}";

        [Required(ErrorMessage = "BannerImages is required.")]
        [MinLength(2, ErrorMessage = "BannerImages must have at least 2 characters.")]
        [MaxLength(1000, ErrorMessage = "BannerImages cannot exceed 1000 characters.")]
        public string BannerImages { get; set; } = "[]";

        [Required(ErrorMessage = "WelcomeMessage is required.")]
        [MinLength(3, ErrorMessage = "WelcomeMessage must have at least 3 characters.")]
        [MaxLength(255, ErrorMessage = "WelcomeMessage cannot exceed 255 characters.")]
        public string WelcomeMessage { get; set; }
    }
}
