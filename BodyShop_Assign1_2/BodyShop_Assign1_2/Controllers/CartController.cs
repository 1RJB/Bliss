using Microsoft.AspNetCore.Mvc;
using BodyShop_Assign1_2.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace BodyShop_Assign1_2.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CartController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext _context = context;


      
        [HttpGet]
       
        public IActionResult GetAll(string? search)
        {
            int userId = GetUserId();
            var cart = _context.Carts.Include(c => c.User)
                                     .FirstOrDefault(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound("Cart not found.");
            }

            var cartItems = _context.CartItems
                                    .Where(ci => ci.CartId == cart.Id)
                                    .Include(ci => ci.Product)
                                    .ToList();

            var data = cartItems.Select(ci => new
            {
                ci.Product.name,
                ci.Quantity,
                ci.Product.Price,
                TotalPrice = ci.Quantity * ci.PriceAtTimeOfAdd
            });

            return Ok(new
            {
                cart.TotalPrice,
                cart.TotalProducts,
                Items = data
            });
        }

        // Add product to the cart
        [HttpPost("{productId}")]
        [Authorize]
        public IActionResult AddProductToCart(int productId, [FromBody] int quantity)
        {
            int userId = GetUserId();
            var cart = _context.Carts.FirstOrDefault(c => c.UserId == userId);

            if (cart == null)
            {
                return NotFound("Cart not found.");
            }

            var product = _context.Products.Find(productId);
            if (product == null)
            {
                return NotFound("Product not found.");
            }

            var cartItem = _context.CartItems
                                    .FirstOrDefault(ci => ci.CartId == cart.Id && ci.ProductId == productId);

            if (cartItem == null)
            {
                cartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = productId,
                    Quantity = quantity,
                    PriceAtTimeOfAdd = product.Price
                };
                _context.CartItems.Add(cartItem);
            }
            else
            {
                cartItem.Quantity += quantity;
                _context.CartItems.Update(cartItem);
            }

            _context.SaveChanges();
            UpdateCartTotal(cart.Id);

            return Ok(cartItem);
        }

        // Update quantity of product in cart
        [HttpPut("{cartItemId}")]
        [Authorize]
        public IActionResult UpdateCartItemQuantity(int cartItemId, [FromBody] int quantity)
        {
            var cartItem = _context.CartItems.Find(cartItemId);
            if (cartItem == null)
            {
                return NotFound("CartItem not found.");
            }

            if (quantity < 1)
            {
                return BadRequest("Quantity must be at least 1.");
            }

            cartItem.Quantity = quantity;
            _context.CartItems.Update(cartItem);
            _context.SaveChanges();

            var cart = _context.Carts.Find(cartItem.CartId);
            UpdateCartTotal(cart.Id);

            return Ok(cartItem);
        }

        // Remove product from the cart
        [HttpDelete("{cartItemId}")]
        [Authorize]
        public IActionResult RemoveProductFromCart(int cartItemId)
        {
            var cartItem = _context.CartItems.Find(cartItemId);
            if (cartItem == null)
            {
                return NotFound("CartItem not found.");
            }

            _context.CartItems.Remove(cartItem);
            _context.SaveChanges();

            var cart = _context.Carts.Find(cartItem.CartId);
            UpdateCartTotal(cart.Id);

            return Ok();
        }

        // Helper method to get the logged-in user's ID
        private int GetUserId()
        {
            return Convert.ToInt32(User.Claims
                .Where(c => c.Type == ClaimTypes.NameIdentifier)
                .Select(c => c.Value)
                .SingleOrDefault());
        }

        // Helper method to update cart totals
        private void UpdateCartTotal(int cartId)
        {
            var cartItems = _context.CartItems.Where(ci => ci.CartId == cartId).ToList();
            decimal totalPrice = cartItems.Sum(ci => ci.Quantity * ci.PriceAtTimeOfAdd);
            int totalProducts = cartItems.Sum(ci => ci.Quantity);

            var cart = _context.Carts.FirstOrDefault(c => c.Id == cartId);
            if (cart != null)
            {
                cart.TotalPrice = totalPrice;
                cart.TotalProducts = totalProducts;
                _context.SaveChanges();
            }
        }
    }
}
