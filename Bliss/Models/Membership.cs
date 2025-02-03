using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bliss.Models
{
    public class Membership
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public MemberType Type { get; set; }

        [MaxLength(500)]
        public string? Benefits { get; set; }

        [Required]
        public int Cost { get; set; }

        [Required]
        [Column(TypeName = "datetime")]
        public DateTime StartDate { get; set; }

        [Required]
        [Column(TypeName = "datetime")]
        public DateTime EndDate { get; set; }
    }
}
