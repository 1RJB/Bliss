using System.ComponentModel.DataAnnotations;


namespace Bliss.Models
{
    public class Product
    {

        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string name { get; set; } = string.Empty;
        [Required, MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        [Required]
        public int Price { get; set; }

        [MaxLength(20)]
        public string? ImageFile { get; set; }

        //foregin key property
        public int UserId { get; set; }

        //navigation property to represen the one-to-many rs
        public User? User { get; set; }

    }
}
