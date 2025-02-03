using BlissAPI.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class Chat
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int SupportTicketId { get; set; }

    [ForeignKey("SupportTicketId")]
    public SupportTicket? SupportTicket { get; set; }

    [Required]
    [MaxLength(1000)]
    public string? Message { get; set; }

    [Required]
    public int SendBy { get; set; }

    [Required]
    [Column(TypeName = "datetime")]
    public DateTime TimeStamp { get; set; }

    [Required]
    public TicketStatus Status { get; set; }

    [MaxLength(1000)]
    public string? ResolvedDescription { get; set; }
}
