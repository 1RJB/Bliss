namespace Bliss.Models
{
    public class TransactionItem
    {
        public int TransactionItemId { get; set; }

        // Foreign key to Transaction
        public int TransactionId { get; set; }
        public Transaction Transaction { get; set; }

        // Foreign key to Product
        public int ProductId { get; set; }
        public Product Product { get; set; }

        // Quantity purchased for this product in the transaction
        public int Quantity { get; set; }

        // Price per unit at the time of the transaction
        public decimal Price { get; set; }

        // Rewards points used for this product in the transaction
        public int? RewardsPoints { get; set; }

        // Rewards points earned for this product in the transaction
        public int? PointsEarned { get; set; }

        // Discount applied for this product in the transaction
        public decimal? DiscountApplied { get; set; }

        // Final amount paid for this product after discount
        public decimal FinalAmount { get; set; }
    }
}
