using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Bliss.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly ILogger<CartController> _logger;

        public CartController(MyDbContext context, ILogger<CartController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddProductToCart([FromBody] dynamic data)
        {
            int userId = data.GetProperty("userId").GetInt32();
            int productId = data.GetProperty("productId").GetInt32();

            _logger.LogInformation("AddProductToCart invoked for UserId: {UserId}, ProductId: {ProductId}", userId, productId);
            try
            {
                // Retrieve the product from the database
                var product = await _context.Products.FindAsync(productId);
                if (product == null)
                {
                    _logger.LogWarning("Product with ID {ProductId} not found.", productId);
                    return NotFound("Product not found");
                }

                // Retrieve the user's cart, including existing items
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                        .ThenInclude(ci => ci.Product)
                    .FirstOrDefaultAsync(c => c.UserId == userId);

                // If no cart exists, create one
                if (cart == null)
                {
                    cart = new Cart { UserId = userId };
                    _context.Carts.Add(cart);
                    _logger.LogInformation("Created new cart for UserId: {UserId}", userId);
                }

                // Check if the product is already in the cart
                var cartItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == productId);
                if (cartItem != null)
                {
                    cartItem.Quantity++;
                    _logger.LogInformation("Incremented quantity for ProductId: {ProductId} in CartId: {CartId} to {Quantity}", productId, cart.Id, cartItem.Quantity);
                }
                else
                {
                    // Create a new CartItem and add it to the cart
                    cartItem = new CartItem
                    {
                        ProductId = productId,
                        Cart = cart,
                        Quantity = 1
                    };
                    cart.CartItems.Add(cartItem);
                    _logger.LogInformation("Added new CartItem for ProductId: {ProductId} to CartId: {CartId}", productId, cart.Id);
                }

                // Save changes to the database
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully updated the cart for UserId: {UserId}", userId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while adding ProductId: {ProductId} to cart for UserId: {UserId}", productId, userId);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCart([FromQuery] int userId)
        {
            // Retrieve the user's cart along with its items and related product info
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            // If no cart exists, create a new, empty cart.
            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    CartItems = new List<CartItem>()
                };

                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return Ok(cart);
        }

        // PUT: api/Cart/item/update
        [HttpPut("item/update")]
        public async Task<IActionResult> UpdateCartItem([FromBody] JsonElement data)
        {
            try
            {
                int cartItemId = data.GetProperty("cartItemId").GetInt32();
                int quantity = data.GetProperty("quantity").GetInt32();

                _logger.LogInformation("UpdateCartItem invoked for CartItemId: {CartItemId} with Quantity: {Quantity}", cartItemId, quantity);

                var cartItem = await _context.CartItems.FindAsync(cartItemId);
                if (cartItem == null)
                {
                    return NotFound("Cart item not found");
                }

                cartItem.Quantity = quantity;
                await _context.SaveChangesAsync();

                return Ok(cartItem);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating cart item.");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // DELETE: api/Cart/item/{cartItemId}
        [HttpDelete("item/{cartItemId}")]
        public async Task<IActionResult> DeleteCartItem(int cartItemId)
        {
            try
            {
                var cartItem = await _context.CartItems.FindAsync(cartItemId);
                if (cartItem == null)
                {
                    return NotFound("Cart item not found");
                }

                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cart item removed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while removing cart item.");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }


    }
}
