using System;
using System.Collections.Generic;
using System.Linq;

namespace Bliss.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public string ShippingAddress { get; set; } = string.Empty;

        // Field for capturing the preferred delivery date and time.
        public DateTime PreferredDeliveryDateTime { get; set; }

        // Payment Information Fields (to be encrypted later using ASP.NET Core Data Protection)
        public string PaymentCardNumber { get; set; } = string.Empty;      // e.g., "4111111111111111"
        public string PaymentExpirationDate { get; set; } = string.Empty;    // e.g., "12/25"
        public string PaymentCVV { get; set; } = string.Empty;               // e.g., "123"

        // Indicates if the transaction has been finalized (closed)
        public bool IsFinalized { get; set; } = false;

        public List<TransactionItem> TransactionItems { get; set; } = new List<TransactionItem>();

        // Computed property for total amount
        public decimal TotalAmount => TransactionItems.Sum(item => item.PriceAtPurchase * item.Quantity);
    }
}
