using Microsoft.AspNetCore.Mvc;
using Bliss.Models;
using Microsoft.EntityFrameworkCore;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TransactionController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext _context = context;

        // GET /Transaction?userId={userId}
        [HttpGet]
        public IActionResult GetAll([FromQuery] int? userId)
        {
            // Optionally filter transactions by userId if provided
            IQueryable<Transaction> query = _context.Transactions;
            if (userId.HasValue)
            {
                query = query.Where(t => t.userID == userId.Value);
            }
            var transactions = query.OrderByDescending(t => t.transactionDate).ToList();
            return Ok(transactions);
        }

        // GET /Transaction/{id}
        [HttpGet("{id}")]
        public IActionResult GetTransaction(int id)
        {
            var transaction = _context.Transactions.Find(id);
            if (transaction == null)
            {
                return NotFound($"Transaction with id {id} not found.");
            }
            return Ok(transaction);
        }

        // POST /Transaction
        [HttpPost]
        public IActionResult CreateTransaction([FromBody] Transaction transaction)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var productExists = _context.Products.Any(p => p.Id == transaction.productID);
            if (!productExists)
            {
                return BadRequest("Invalid productID. Please ensure the product exists before creating a transaction.");
            }

            // Set timestamps on creation
            transaction.createdAt = DateTime.Now;
            transaction.updatedAt = DateTime.Now;

            _context.Transactions.Add(transaction);
            _context.SaveChanges();
            return Ok(transaction);
        }

        // PUT /Transaction/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateTransaction(int id, [FromBody] Transaction updatedTransaction)
        {
            var transaction = _context.Transactions.Find(id);
            if (transaction == null)
            {
                return NotFound($"Transaction with id {id} not found.");
            }

            // Update properties with values from the updatedTransaction
            transaction.userID = updatedTransaction.userID;
            transaction.productID = updatedTransaction.productID;
            transaction.quantity = updatedTransaction.quantity;
            transaction.price = updatedTransaction.price;
            transaction.rewardsPoints = updatedTransaction.rewardsPoints;
            transaction.pointsEarned = updatedTransaction.pointsEarned;
            transaction.discountApplied = updatedTransaction.discountApplied;
            transaction.finalAmount = updatedTransaction.finalAmount;
            transaction.transactionDate = updatedTransaction.transactionDate;
            transaction.updatedAt = DateTime.Now;

            _context.Transactions.Update(transaction);
            _context.SaveChanges();
            return Ok(transaction);
        }

        // DELETE /Transaction/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteTransaction(int id)
        {
            var transaction = _context.Transactions.Find(id);
            if (transaction == null)
            {
                return NotFound($"Transaction with id {id} not found.");
            }

            _context.Transactions.Remove(transaction);
            _context.SaveChanges();
            return Ok($"Transaction with id {id} deleted successfully.");
        }
    }
}
