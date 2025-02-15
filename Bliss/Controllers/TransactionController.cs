using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bliss.Models;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TransactionController : ControllerBase
    {
        private readonly MyDbContext _context;

        public TransactionController(MyDbContext context)
        {
            _context = context;
        }

        // GET /Transaction?productId={productId}
        // If productId is provided, we return only transactions containing that product via TransactionItems.
        [HttpGet]
        public IActionResult GetAll([FromQuery] int? productId)
        {
            IQueryable<Transaction> query = _context.Transactions.Include(t => t.TransactionItems);
            if (productId.HasValue)
            {
                query = query.Where(t => t.TransactionItems.Any(item => item.ProductId == productId.Value));
            }
            var transactions = query.OrderByDescending(t => t.transactionDate).ToList();
            return Ok(transactions);
        }

        // GET /Transaction/{id}
        [HttpGet("{id}")]
        public IActionResult GetTransaction(int id)
        {
            var transaction = _context.Transactions
                .Include(t => t.TransactionItems)
                .ThenInclude(ti => ti.Product)
                .FirstOrDefault(t => t.transactionID == id);
            if (transaction == null)
            {
                return NotFound($"Transaction with ID {id} not found.");
            }
            return Ok(transaction);
        }

        // POST /Transaction
        // Expects a Transaction with a non-empty list of TransactionItems.
        [HttpPost]
        public IActionResult CreateTransaction([FromBody] Transaction transaction)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate that there is at least one transaction item
            if (transaction.TransactionItems == null || !transaction.TransactionItems.Any())
            {
                return BadRequest("A transaction must include at least one product.");
            }

            // Validate each transaction item
            foreach (var item in transaction.TransactionItems)
            {
                var product = _context.Products.Find(item.ProductId);
                if (product == null)
                {
                    return NotFound($"Product with ID {item.ProductId} not found.");
                }
                // Calculate final amount if not provided or invalid
                if (item.FinalAmount <= 0)
                {
                    decimal discount = item.DiscountApplied ?? 0;
                    item.FinalAmount = (item.Price * item.Quantity) - discount;
                }
            }

            transaction.createdAt = DateTime.Now;
            transaction.updatedAt = DateTime.Now;

            _context.Transactions.Add(transaction);
            _context.SaveChanges();

            return Ok(transaction);
        }

        // PUT /Transaction/{id}
        // Updates the transaction and replaces its transaction items with the provided list.
        [HttpPut("{id}")]
        public IActionResult UpdateTransaction(int id, [FromBody] Transaction updatedTransaction)
        {
            var transaction = _context.Transactions
                .Include(t => t.TransactionItems)
                .FirstOrDefault(t => t.transactionID == id);
            if (transaction == null)
            {
                return NotFound($"Transaction with ID {id} not found.");
            }

            // Update transaction-level properties
            transaction.userID = updatedTransaction.userID;
            transaction.transactionDate = updatedTransaction.transactionDate;
            transaction.updatedAt = DateTime.Now;

            // Remove existing transaction items
            _context.TransactionItems.RemoveRange(transaction.TransactionItems);

            // Validate and add new transaction items
            if (updatedTransaction.TransactionItems == null || !updatedTransaction.TransactionItems.Any())
            {
                return BadRequest("A transaction must include at least one product.");
            }

            foreach (var item in updatedTransaction.TransactionItems)
            {
                var product = _context.Products.Find(item.ProductId);
                if (product == null)
                {
                    return NotFound($"Product with ID {item.ProductId} not found.");
                }
                if (item.FinalAmount <= 0)
                {
                    decimal discount = item.DiscountApplied ?? 0;
                    item.FinalAmount = (item.Price * item.Quantity) - discount;
                }
                transaction.TransactionItems.Add(item);
            }

            _context.Transactions.Update(transaction);
            _context.SaveChanges();

            return Ok(transaction);
        }

        // DELETE /Transaction/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteTransaction(int id)
        {
            var transaction = _context.Transactions
                .Include(t => t.TransactionItems)
                .FirstOrDefault(t => t.transactionID == id);
            if (transaction == null)
            {
                return NotFound($"Transaction with ID {id} not found.");
            }

            _context.Transactions.Remove(transaction);
            _context.SaveChanges();

            return Ok($"Transaction with ID {id} deleted successfully.");
        }
    }
}
