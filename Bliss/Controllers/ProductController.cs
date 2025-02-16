using Microsoft.AspNetCore.Mvc;
using Bliss.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using AutoMapper;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProductController(MyDbContext context, IMapper mapper) : ControllerBase
    {
        private readonly MyDbContext _context = context;
        private readonly IMapper _mapper = mapper;

        // ✅ Include Sizes in Query
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Product>), StatusCodes.Status200OK)]
        public IActionResult GetAll(string? search, string? type, int? priceMin, int? priceMax)
        {
            IQueryable<Product> result = _context.Products
                .Include(t => t.User)
                .Include(t => t.Sizes); // ✅ Include Sizes

            // Apply Filters
            if (!string.IsNullOrEmpty(search))
                result = result.Where(t => t.name.Contains(search) || t.Description.Contains(search));
            if (!string.IsNullOrEmpty(type))
                result = result.Where(t => t.Type == type);
            if (priceMin.HasValue)
                result = result.Where(t => t.Price >= priceMin.Value);
            if (priceMax.HasValue)
                result = result.Where(t => t.Price <= priceMax.Value);

            var list = result.OrderByDescending(x => x.Price).ToList();
            var data = list.Select(t => new
            {
                t.Id,
                t.name,
                t.Description,
                t.ImageFile,
                t.Price,
                t.Type,
                t.UserId,
                Sizes = t.Sizes.Select(s => new { s.Size, s.Price }), // ✅ Include Sizes
                User = new { t.User?.Name }
            });

            return Ok(data);
        }

        // ✅ Include Sizes in Single Product Query
        [HttpGet("{id}")]
        public IActionResult GetProduct(int id)
        {
            Product? product = _context.Products
                .Include(t => t.User)
                .Include(t => t.Sizes)  // ✅ Include Sizes
                .SingleOrDefault(t => t.Id == id);

            if (product == null)
                return NotFound();

            var data = new
            {
                product.Id,
                product.name,
                product.Description,
                product.ImageFile,
                product.Price,
                product.Type,
                product.UserId,
                Sizes = product.Sizes.Select(s => new { s.Size, s.Price }),
                User = new { product.User?.Name }
            };

            return Ok(data);
        }

        // ✅ Add Sizes When Adding a Product
        [HttpPost, Authorize]
        public IActionResult AddProduct([FromBody] Product product)
        {
            int userId = GetUserId();

            var myProduct = new Product()
            {
                name = product.name.Trim(),
                Description = product.Description.Trim(),
                Price = product.Price,
                ImageFile = product.ImageFile,
                Type = product.Type,
                UserId = userId,
                Sizes = product.Sizes // ✅ Capture Sizes
            };

            _context.Products.Add(myProduct);
            _context.SaveChanges();
            return Ok(myProduct);
        }

        // ✅ Update Product with Sizes
        [HttpPut("{id}"), Authorize]
        public IActionResult UpdateProduct(int id, [FromBody] Product product)
        {
            var myProduct = _context.Products
                .Include(p => p.Sizes)  // ✅ Include Sizes
                .FirstOrDefault(p => p.Id == id);

            if (myProduct == null)
                return NotFound();

            int userId = GetUserId();
            if (myProduct.UserId != userId)
                return Forbid();

            myProduct.name = product.name.Trim();
            myProduct.Description = product.Description.Trim();
            myProduct.ImageFile = product.ImageFile;
            myProduct.Price = product.Price;
            myProduct.Type = product.Type;

            // ✅ Remove old sizes and add new sizes
            _context.ProductSizes.RemoveRange(myProduct.Sizes);
            myProduct.Sizes = product.Sizes;

            _context.SaveChanges();
            return Ok(myProduct);
        }

        // ✅ Ensure Sizes are Deleted When Product is Deleted
        [HttpDelete("{id}")]
        public IActionResult DeleteProduct(int id)
        {
            var myProduct = _context.Products
                .Include(p => p.Sizes) // ✅ Include Sizes
                .FirstOrDefault(p => p.Id == id);

            if (myProduct == null)
                return NotFound();

            _context.ProductSizes.RemoveRange(myProduct.Sizes); // ✅ Remove Sizes First
            _context.Products.Remove(myProduct);
            _context.SaveChanges();
            return Ok();
        }

        private int GetUserId()
        {
            return Convert.ToInt32(User.Claims
                .Where(c => c.Type == ClaimTypes.NameIdentifier)
                .Select(c => c.Value)
                .SingleOrDefault());
        }
    }
}
