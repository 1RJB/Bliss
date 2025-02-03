using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bliss.Models
{
    public class RewardPoints
    {
        [Key]
        public int UserId { get; set; }

        [Required]
        public int Points { get; set; }

        [Required]
        [Column(TypeName = "datetime")]
        public DateTime ResetDay { get; set; }

        public RewardPoints()
        {
            ResetDay = new DateTime(DateTime.Now.Year + 1, 1, 1);
        }
    }
}
