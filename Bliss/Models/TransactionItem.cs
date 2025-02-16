using System.Text.Json.Serialization;

namespace Bliss.Models
{
    public class TransactionItem
    {
        public int Id { get; set; }
        public int TransactionId { get; set; }
        [JsonIgnore]
        public Transaction Transaction { get; set; }

        public int ProductId { get; set; }
        public Product Product { get; set; }

        public int? ProductSizeId { get; set; }  // Make it nullable
        public ProductSize ProductSize { get; set; }

        public int Quantity { get; set; }
        public decimal PriceAtPurchase { get; set; }
    }
}
