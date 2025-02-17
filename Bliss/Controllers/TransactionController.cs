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
        // Removes any existing open transaction for the user and creates a new one.
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

            // Retrieve the user's cart along with its items, product info, and product size.
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.ProductSize)
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
                PreferredDeliveryDateTime = DateTime.UtcNow,
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
                    ProductSizeId = cartItem.ProductSizeId,  // Add this
                    Quantity = cartItem.Quantity,
                    PriceAtPurchase = cartItem.ProductSize?.Price ?? cartItem.Product.Price
                });
            }

            _context.Transactions.Add(transaction);
            // Optionally, you can remove the cart here if desired.
            // _context.Carts.Remove(cart);
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
        public async Task<IActionResult> UpdateAndMaybeFinalizeTransaction(
    [FromBody] JsonElement data,
    [FromServices] IEmailService emailService)
        {
            int userId = data.GetProperty("userId").GetInt32();

            // Extract fields (default to empty string if not provided)
            string shippingAddress = data.TryGetProperty("shippingAddress", out JsonElement addrEl)
                ? addrEl.GetString()
                : "";
            string deliveryStr = data.TryGetProperty("preferredDeliveryDateTime", out JsonElement deliveryEl)
                ? deliveryEl.GetString()
                : "";
            DateTime? preferredDeliveryDateTime = null;
            if (!string.IsNullOrWhiteSpace(deliveryStr))
            {
                preferredDeliveryDateTime = DateTime.Parse(deliveryStr);
            }
            string paymentCardNumber = data.TryGetProperty("paymentCardNumber", out JsonElement cardEl)
                ? cardEl.GetString()
                : "";
            string paymentExpirationDate = data.TryGetProperty("paymentExpirationDate", out JsonElement expEl)
                ? expEl.GetString()
                : "";
            string paymentCVV = data.TryGetProperty("paymentCVV", out JsonElement cvvEl)
                ? cvvEl.GetString()
                : "";

            // Retrieve the current open transaction for the user.
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.UserId == userId && !t.IsFinalized);
            if (transaction == null)
            {
                return NotFound("No current open transaction found to update");
            }

            // Update fields regardless
            transaction.ShippingAddress = shippingAddress;
            if (preferredDeliveryDateTime.HasValue)
            {
                transaction.PreferredDeliveryDateTime = preferredDeliveryDateTime.Value;
            }
            if (!string.IsNullOrWhiteSpace(paymentCardNumber))
            {
                transaction.PaymentCardNumber = _protector.Protect(paymentCardNumber);
            }
            if (!string.IsNullOrWhiteSpace(paymentExpirationDate))
            {
                transaction.PaymentExpirationDate = paymentExpirationDate;
            }
            if (!string.IsNullOrWhiteSpace(paymentCVV))
            {
                transaction.PaymentCVV = paymentCVV;
            }

            // Check if all required fields are present to finalize:
            bool hasShippingInfo = !string.IsNullOrWhiteSpace(transaction.ShippingAddress)
                                   && transaction.PreferredDeliveryDateTime != default(DateTime);
            bool hasPaymentInfo = !string.IsNullOrWhiteSpace(transaction.PaymentCardNumber)
                                  && !string.IsNullOrWhiteSpace(transaction.PaymentExpirationDate)
                                  && !string.IsNullOrWhiteSpace(transaction.PaymentCVV);

            if (hasShippingInfo && hasPaymentInfo)
            {
                transaction.IsFinalized = true;
                _logger.LogInformation("All required fields present. Finalizing transaction for UserId: {UserId}", userId);

                // Close out the cart when finalizing
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                if (cart != null)
                {
                    _logger.LogInformation("Removing cart and items for UserId: {UserId}", userId);
                    // Remove all cart items
                    _context.CartItems.RemoveRange(cart.CartItems);
                    // Remove the cart itself
                    _context.Carts.Remove(cart);
                }

                // Calculate total for receipt
                decimal overallTotal = transaction.TransactionItems
                    .Sum(item => (decimal)item.PriceAtPurchase * item.Quantity);

                // Send receipt email
                try
                {
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
                    if (user != null && !string.IsNullOrWhiteSpace(user.Email))
                    {
                        string receiptHtml = $"<h1>Thank you for your order!</h1>" +
                                           $"<p>Transaction ID: {transaction.Id}</p>" +
                                           $"<p>Date: {transaction.TransactionDate.ToLocalTime()}</p>" +
                                           "<p>We appreciate your business.</p>";

                        await emailService.SendEmailAsync(user.Email, "Your Receipt from Bliss", receiptHtml);
                        _logger.LogInformation("Receipt email sent to {Email}", user.Email);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send receipt email for UserId: {UserId}", userId);
                    // Don't throw - we still want to complete the transaction even if email fails
                }
            }
            else
            {
                _logger.LogInformation("Transaction updated for UserId: {UserId} but not all fields present for finalization", userId);
            }

            await _context.SaveChangesAsync();
            return Ok(transaction);
        }


        // POST: api/transaction/finalize
        // Finalizes (closes) the current open transaction.
        // Expects payload: { "userId": 1 }
        [HttpPost("finalize")]
        public async Task<IActionResult> FinalizeTransaction(
        [FromBody] JsonElement data,
        [FromServices] IEmailService emailService)
        {
            int userId = data.GetProperty("userId").GetInt32();

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.UserId == userId && !t.IsFinalized);
            if (transaction == null)
            {
                var finalizedTransaction = await _context.Transactions
                    .FirstOrDefaultAsync(t => t.UserId == userId && t.IsFinalized);
                if (finalizedTransaction != null)
                {
                    return Ok(finalizedTransaction);
                }
                return NotFound("No current open transaction found to finalize");
            }

            // Retrieve and remove the user's cart (if necessary)
            var cart = await _context.Carts
     .Include(c => c.CartItems)
     .FirstOrDefaultAsync(c => c.UserId == userId);
            if (cart != null)
            {
                // Remove all cart items at once
                _context.CartItems.RemoveRange(cart.CartItems);
                // Remove the cart itself
                _context.Carts.Remove(cart);
                await _context.SaveChangesAsync();
            }

            // Then remove the cart


            transaction.IsFinalized = true;
            await _context.SaveChangesAsync();

            // Calculate overall total from the transaction items
            decimal overallTotal = transaction.TransactionItems
                .Sum(item => (decimal)item.PriceAtPurchase * item.Quantity);


            // Build a simple HTML receipt for the email.
            string receiptHtml = $"<h1>Thank you for your order!</h1>" +
                                 $"<p>Transaction ID: {transaction.Id}</p>" +
                                 $"<p>Date: {transaction.TransactionDate.ToLocalTime()}</p>" +
                                 "<p>We appreciate your business.</p>";

            // Retrieve the user's email dynamically from the database.
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || string.IsNullOrWhiteSpace(user.Email))
            {
                _logger.LogWarning("Could not retrieve email for userId {UserId}", userId);
                return NotFound("User email not found.");
            }

            // Send the receipt email using the user's actual email.
            await emailService.SendEmailAsync(user.Email, "Your Receipt from Bliss", receiptHtml);
            _logger.LogInformation("Receipt email sent to {Email}", user.Email);

            return Ok(transaction);
        }


        // GET: api/transaction/latest?userId=1
        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestFinalizedTransaction([FromQuery] int userId)
        {

            var transaction = await _context.Transactions
                .Include(t => t.TransactionItems)
                    .ThenInclude(ti => ti.Product)
                .Include(t => t.TransactionItems)  // Add this new Include
                    .ThenInclude(ti => ti.ProductSize)  // Add ProductSize
                .FirstOrDefaultAsync(t => t.UserId == userId && t.IsFinalized);

            if (transaction == null)
            {
                return NotFound("No finalized transaction found.");
            }
            return Ok(transaction);
        }


    }
}