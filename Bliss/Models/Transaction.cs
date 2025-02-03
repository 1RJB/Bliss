namespace Bliss.Models
{
    public class Transaction
    {
        // Primary Key
        public int transactionID { get; set; }

        // Foreign Key - User ID
        public int userID { get; set; }

        // Foreign Key - Product ID
        public int productID { get; set; }

        // Quantity purchased
        public int quantity { get; set; }

        // Price per unit
        public decimal price { get; set; }

        // Rewards points used in the transaction
        public int? rewardsPoints { get; set; }

        // Rewards points earned from the transaction
        public int? pointsEarned { get; set; }

        // Discount applied to the transaction
        public decimal? discountApplied { get; set; }

        // Final amount paid after discount
        public decimal finalAmount { get; set; }

        // Transaction date
        public DateTime transactionDate { get; set; }

        // Timestamp for when the transaction was created
        public DateTime createdAt { get; set; } = DateTime.Now;

        // Timestamp for when the transaction was last updated
        public DateTime updatedAt { get; set; } = DateTime.Now;
    }
}
