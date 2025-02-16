using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.DataProtection;
using Bliss.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly ILogger<TransactionController> _logger;
        private readonly IDataProtector _protector;

        public TransactionController(MyDbContext context, ILogger<TransactionController> logger, IDataProtectionProvider dataProtectionProvider)
        {
            _context = context;
            _logger = logger;
            _protector = dataProtectionProvider.CreateProtector("CreditCardProtector");
        }

        // POST: api/transaction/init
        // Re-initializes the transaction from the current cart.
        // This removes any existing open transaction for the user and creates a new one.
        // Expects payload: { "userId": 1 }
        [HttpPost("init")]
        public async Task<IActionResult> InitTransaction([FromBody] JsonElement data)
        {
            int userId = data.GetProperty("userId").GetInt32();
            _logger.LogInformation("InitTransaction invoked for UserId: {UserId}", userId);

            // Remove any existing open transaction for the user.
            var existingTransaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.UserId == userId && !t.IsFinalized);
            if (existingTransaction != null)
            {
                _context.Transactions.Remove(existingTransaction);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Removed existing open transaction for UserId: {UserId}", userId);
            }

            // Retrieve the user's cart along with its items and product info.
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || cart.CartItems == null || !cart.CartItems.Any())
            {
                return NotFound("Cart is empty");
            }

            // Create a new transaction from the cart.
            var transaction = new Transaction
            {
                UserId = userId,
                TransactionDate = DateTime.UtcNow,
                ShippingAddress = "",
                PreferredDeliveryDateTime = DateTime.UtcNow, // placeholder; to be updated later
                PaymentCardNumber = "",
                PaymentExpirationDate = "",
                PaymentCVV = "",
                IsFinalized = false
            };

            foreach (var cartItem in cart.CartItems)
            {
                transaction.TransactionItems.Add(new TransactionItem
                {
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity,
                    PriceAtPurchase = cartItem.Product.Price
                });
            }

            // Remove the cart (since it's now absorbed into the transaction)
            _context.Transactions.Add(transaction);
            //_context.Carts.Remove(cart);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Transaction initialized successfully for UserId: {UserId}, TransactionId: {TransactionId}", userId, transaction.Id);
            return Ok(transaction);
        }

        // PUT: api/transaction/update
        // Updates the open transaction with shipping and payment info.
        // Expects payload:
        // {
        //    "userId": 1,
        //    "shippingAddress": "123 Main St",
        //    "preferredDeliveryDateTime": "2025-03-01T14:30:00Z",
        //    "paymentCardNumber": "4111111111111111",
        //    "paymentExpirationDate": "12/25",
        //    "paymentCVV": "123"
        // }
        [HttpPut("update")]
        public async Task<IActionResult> UpdateTransaction([FromBody] JsonElement data)
        {
            int userId = data.GetProperty("userId").GetInt32();
            string cardNumber = data.GetProperty("paymentCardNumber").GetString();
            string expirationDate = data.GetProperty("paymentExpirationDate").GetString();
            string cvv = data.GetProperty("paymentCVV").GetString();
            string shippingAddress = data.GetProperty("shippingAddress").GetString();
            string deliveryStr = data.GetProperty("preferredDeliveryDateTime").GetString();
            DateTime preferredDeliveryDateTime = DateTime.Parse(deliveryStr);
            

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.UserId == userId && !t.IsFinalized);
            if (transaction == null)
            {
                return NotFound("No current open transaction found to update");
            }

            transaction.ShippingAddress = shippingAddress;
            transaction.PreferredDeliveryDateTime = preferredDeliveryDateTime;
            transaction.PaymentCardNumber = _protector.Protect(cardNumber);
            transaction.PaymentExpirationDate = expirationDate;
            transaction.PaymentCVV = cvv;

            await _context.SaveChangesAsync();
            return Ok(transaction);
        }

        // POST: api/transaction/finalize
        // Finalizes (closes) the current open transaction.
        // Expects payload: { "userId": 1 }
        [HttpPost("finalize")]
        public async Task<IActionResult> FinalizeTransaction([FromBody] JsonElement data)
        {

            int userId = data.GetProperty("userId").GetInt32();

            // Retrieve the current open transaction.
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.UserId == userId && !t.IsFinalized);
            if (transaction == null)
            {
                return NotFound("No current open transaction found to finalize");
            }

            // Retrieve the user's cart (if it exists) and remove it.
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart != null)
            {
                _context.Carts.Remove(cart);
            }

            // Mark the transaction as finalized.
            transaction.IsFinalized = true;
            await _context.SaveChangesAsync();

          
            return Ok(transaction);
        }
    }
}
