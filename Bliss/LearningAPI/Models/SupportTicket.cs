using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlissAPI.Models
{
    public enum TicketType
    {
        TechnicalIssue,
        AccountProblem,
        BillingPayment,
        GeneralInquiry,
        Others
    }

    public enum PriorityLevel
    {
        Low,
        Medium,
        High
    }

    public enum TicketStatus
    {
        Unassigned,
        OnProgress,
        Completed
    }

    public class SupportTicket
    {
        [Key]
        public int Id { get; set; }

        public int? AssignedTo { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        [Required]
        public TicketType Type { get; set; }

        [Required]
        [MaxLength(100)]
        public string? Title { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public PriorityLevel Priority { get; set; }

        [Required]
        public TicketStatus Status { get; set; }

        [Required]
        [Column(TypeName = "datetime")]
        public DateTime StartDate { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime? EndDate { get; set; }
    }
}
