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

        // GET /Product?search={search}&type={type}&priceMin={priceMin}&priceMax={priceMax}
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Product>), StatusCodes.Status200OK)]
        public IActionResult GetAll(string? search, string? type, int? priceMin, int? priceMax)
        {
            IQueryable<Product> result = _context.Products.Include(t => t.User);
            
            // Apply Search Filter
            if (!string.IsNullOrEmpty(search))
            {
                result = result.Where(t => t.name.Contains(search) || t.Description.Contains(search));
            }

            // Apply Type Filter
            if (!string.IsNullOrEmpty(type))
            {
                result = result.Where(t => t.Type == type);
            }

            // Apply Price Range Filter
            if (priceMin.HasValue)
            {
                result = result.Where(t => t.Price >= priceMin.Value);
            }
            if (priceMax.HasValue)
            {
                result = result.Where(t => t.Price <= priceMax.Value);
            }

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
                User = new
                {
                    t.User?.Name
                }
                // Optionally, if you need to expose associated homepages:
                // Homepages = t.Homepages.Select(h => new { h.HomepageId, h.WelcomeMessage })
            });

            Console.WriteLine($"Filtered Products: {list.Count} items found");
            return Ok(data);
        }

        // POST /Product
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
            };
            _context.Products.Add(myProduct);
            _context.SaveChanges();

            return Ok(myProduct);
        }

        // GET /Product/{id}
        [HttpGet("{id}")]
        public IActionResult GetProduct(int id)
        {
            Product? product = _context.Products
                .Include(t => t.User)
                .Include(t => t.Homepages)  // Optionally include related homepages
                .SingleOrDefault(t => t.Id == id);
            if (product == null)
            {
                return NotFound();
            }
            var data = new
            {
                product.Id,
                product.name,
                product.Description,
                product.ImageFile,
                product.Price,
                product.Type,
                product.UserId,
                User = new
                {
                    product.User?.Name
                },
                // Optionally expose homepages:
                // Homepages = product.Homepages.Select(h => new { h.HomepageId, h.WelcomeMessage })
            };

            return Ok(data);
        }

        // PUT /Product/{id}
        [HttpPut("{id}"), Authorize]
        public IActionResult UpdateProduct(int id, [FromBody] Product product)
        {
            var myProduct = _context.Products.Find(id);
            if (myProduct == null)
            {
                return NotFound();
            }
            int userId = GetUserId();
            if (myProduct.UserId != userId)
            {
                return Forbid();
            }

            myProduct.name = product.name.Trim();
            myProduct.Description = product.Description.Trim();
            myProduct.ImageFile = product.ImageFile;
            myProduct.Price = product.Price;
            myProduct.Type = product.Type;

            _context.SaveChanges();
            return Ok(myProduct);
        }

        // DELETE /Product/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteProduct(int id)
        {
            var myProduct = _context.Products.Find(id);
            if (myProduct == null)
            {
                return NotFound();
            }

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
