namespace Bliss.Models
{
    public class Transaction
    {
        // Primary Key
        public int transactionID { get; set; }

        // Foreign Key - User ID (the user who made the transaction)
        public int userID { get; set; }

        // Date when the transaction occurred
        public DateTime transactionDate { get; set; }

        // Timestamp for when the transaction was created
        public DateTime createdAt { get; set; } = DateTime.Now;

        // Timestamp for when the transaction was last updated
        public DateTime updatedAt { get; set; } = DateTime.Now;

        // Navigation property: a transaction can contain one or more products through TransactionItems
        public List<TransactionItem> TransactionItems { get; set; } = new List<TransactionItem>();
    }
}
