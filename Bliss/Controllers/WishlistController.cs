using Bliss.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WishlistController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext _context = context;
        

        [HttpGet]
        public IActionResult GetAll(string? search)
        {

            IQueryable<Wishlist> result = _context.Wishlists.Include(t => t.User);
            if (search != null)
            {
                result = result.Where(x => x.Name.Contains(search)
                || x.Description.Contains(search));
            }
            var list = result.OrderByDescending(x => x.CreatedAt).ToList();
            var data = list.Select(t => new
            {
                t.Id,
                t.Name,
                t.Description,
                t.CreatedAt,
                t.UserId,
                User = new
                {
                    t.User?.Name
                }
            });
            return Ok(data);
        }

        [HttpGet("{id}")]
        public IActionResult GetWishlist(int id)
        {
            Wishlist? wishlist = _context.Wishlists
                .Include(w => w.User)
                .Include(w => w.Products)  // ✅ Ensure Products are loaded
                .ThenInclude(p => p.Wishlists) // ✅ Ensure two-way linking
                .SingleOrDefault(w => w.Id == id);

            if (wishlist == null)
            {
                return NotFound();
            }

            var data = new
            {
                wishlist.Id,
                wishlist.Name,
                wishlist.Description,
                wishlist.CreatedAt,
                wishlist.UserId,
                User = new { wishlist.User?.Name },
                Products = wishlist.Products.Select(p => new
                {
                    Id = p.Id,
                    Name = p.name,
                    Description = p.Description,
                    Price = p.Price,
                    ImageFile = p.ImageFile ?? "" // Ensure image is sent
                }).ToList()
            };

            Console.WriteLine($"Wishlist {id} API Response: {data.Products.Count} products."); // ✅ Debug log

            return Ok(data);
        }



        [HttpPost, Authorize]
        public IActionResult AddWishlist(Wishlist wishlist)
        {
            int userId = GetUserId();
            var now = DateTime.Now;
            var myWishlist = new Wishlist()
            {
                Name = wishlist.Name.Trim(),
                Description = wishlist.Description.Trim(),
                CreatedAt = now,
                UserId = userId

            };
            _context.Wishlists.Add(myWishlist);
            _context.SaveChanges();
            return Ok(myWishlist);
        }

        [HttpPost("{wishlistId}/addProduct/{productId}"), Authorize]
        public IActionResult AddProductToWishlist(int wishlistId, int productId)
        {
            var wishlist = _context.Wishlists.Include(w => w.Products).FirstOrDefault(w => w.Id == wishlistId);
            if (wishlist == null) return NotFound("Wishlist not found");

            var product = _context.Products.Find(productId);
            if (product == null) return NotFound("Product not found");

            // Ensure product is not already in the wishlist
            if (!wishlist.Products.Any(p => p.Id == productId))
            {
                wishlist.Products.Add(product);
                _context.SaveChanges();
            }

            return Ok();
        }

        [HttpPut("{id}"), Authorize]
        public IActionResult UpdateTutorial(int id, Wishlist Wishlist)
        {
            var myWishlist = _context.Wishlists.Find(id);
            if (myWishlist == null)
            {
                return NotFound();
            }
            int userId = GetUserId();
            if (myWishlist.UserId != userId)
            {
                return Forbid();
            }

            myWishlist.Name = Wishlist.Name.Trim();
            myWishlist.Description = Wishlist.Description.Trim();
            myWishlist.UpdatedAt = DateTime.Now;
            _context.SaveChanges();
            return Ok();
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteTutorial(int id)
        {
            var myWishlist = _context.Wishlists.Find(id);
            if (myWishlist == null)
            {
                return NotFound();
            }
            _context.Wishlists.Remove(myWishlist);
            _context.SaveChanges();
            return Ok();
        }


        [HttpDelete("{wishlistId}/removeProduct/{productId}"), Authorize]
        public IActionResult RemoveProductFromWishlist(int wishlistId, int productId)
        {
            var wishlist = _context.Wishlists.Include(w => w.Products).FirstOrDefault(w => w.Id == wishlistId);
            if (wishlist == null) return NotFound("Wishlist not found");

            var product = wishlist.Products.FirstOrDefault(p => p.Id == productId);
            if (product == null) return NotFound("Product not found in wishlist");

            wishlist.Products.Remove(product);
            _context.SaveChanges();

            return Ok();
        }

        private int GetUserId()
        {
            return Convert.ToInt32(User.Claims
            .Where(c => c.Type == ClaimTypes.NameIdentifier)
            .Select(c => c.Value).SingleOrDefault());
        }
    }
}
