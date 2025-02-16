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
        public async Task<IActionResult> AddProductToCart([FromBody] JsonElement data)
        {
            try
            {
                // Extract payload fields
                int userId = data.GetProperty("userId").GetInt32();
                int productId = data.GetProperty("productId").GetInt32();
                string productSizeStr = data.GetProperty("productSize").GetString();
                int quantity = data.GetProperty("quantity").GetInt32();
                // Price is provided but we'll validate it against the product size record
                decimal pricePayload = data.GetProperty("price").GetDecimal();

                _logger.LogInformation("AddProductToCart invoked for UserId: {UserId}, ProductId: {ProductId}, ProductSize: {ProductSize}",
                    userId, productId, productSizeStr);

                // Retrieve the product
                var product = await _context.Products.FindAsync(productId);
                if (product == null)
                {
                    _logger.LogWarning("Product with ID {ProductId} not found.", productId);
                    return NotFound("Product not found");
                }

                // Retrieve the product size record from the ProductSize table for this product.
                // This assumes that your ProductSize model contains a Size property that is a string.
                var productSizeRecord = await _context.ProductSizes
                    .FirstOrDefaultAsync(ps => ps.ProductId == productId && ps.Size == productSizeStr);

                if (productSizeRecord == null)
                {
                    _logger.LogWarning("Product size '{ProductSize}' not found for Product ID {ProductId}.", productSizeStr, productId);
                    return NotFound("Product size not found");
                }

                // Use the price from the product size record (ignoring the price from the payload if needed)
                decimal sizePrice = productSizeRecord.Price;
                if (sizePrice != pricePayload)
                {
                    _logger.LogInformation("Price mismatch: Using ProductSize price {SizePrice} over payload price {PayloadPrice}", sizePrice, pricePayload);
                }

                // Retrieve or create the user's cart
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .FirstOrDefaultAsync(c => c.UserId == userId);
                if (cart == null)
                {
                    cart = new Cart { UserId = userId };
                    _context.Carts.Add(cart);
                    _logger.LogInformation("Created new cart for UserId: {UserId}", userId);
                }

                // Ensure your CartItem model includes a ProductSizeId property.
                // Check if a CartItem with the same product and product size already exists.
                var cartItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == productId && ci.ProductSizeId == productSizeRecord.Id);
                if (cartItem != null)
                {
                    cartItem.Quantity += quantity;
                    _logger.LogInformation("Incremented quantity for ProductId: {ProductId} with size {ProductSize} in CartId: {CartId} to {Quantity}",
                        productId, productSizeStr, cart.Id, cartItem.Quantity);
                }
                else
                {
                    cartItem = new CartItem
                    {
                        ProductId = productId,
                        ProductSizeId = productSizeRecord.Id,
                        Quantity = quantity
                    };
                    cart.CartItems.Add(cartItem);
                    _logger.LogInformation("Added new CartItem for ProductId: {ProductId} with size {ProductSize} to CartId: {CartId}",
                        productId, productSizeStr, cart.Id);
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully updated the cart for UserId: {UserId}", userId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while adding product to cart.");
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
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.ProductSize)
                 .FirstOrDefaultAsync(c => c.UserId == userId);

            // Add debug logging
            if (cart != null)
            {
                foreach (var item in cart.CartItems)
                {
                    _logger.LogInformation(
                        "CartItem {ItemId}: ProductSize {ProductSizeId} - Size: {Size}, Price: {Price}",
                        item.Id,
                        item.ProductSizeId,
                        item.ProductSize?.Size ?? "null",
                        item.ProductSize?.Price.ToString() ?? "null"
                    );
                }
            }

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
