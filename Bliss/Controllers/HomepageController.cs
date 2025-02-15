using Microsoft.AspNetCore.Mvc;
using Bliss.Models;
using Microsoft.EntityFrameworkCore;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HomepageController(MyDbContext context) : ControllerBase
    {
        private readonly MyDbContext _context = context;

        // GET /Homepage?search={search}
        [HttpGet]
        public IActionResult GetAll([FromQuery] string? search)
        {
            IQueryable<Homepage> query = _context.Homepages;
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(h =>
                    h.Name.Contains(search) ||
                    (h.Description != null && h.Description.Contains(search)) ||
                    h.WelcomeMessage.Contains(search) ||
                    h.FeaturedProducts.Contains(search) ||
                    h.BannerImages.Contains(search)
                );
            }
            var list = query.OrderByDescending(h => h.CreatedAt).ToList();
            Console.WriteLine($"Retrieved {list.Count} homepage records.");
            return Ok(list);
        }

        // GET /Homepage/{id}
        [HttpGet("{id}")]
        public IActionResult GetHomepage(int id)
        {
            Console.WriteLine($"Fetching homepage with ID: {id}");
            var homepage = _context.Homepages
                .Include(h => h.Products) // Include products if you need to display them on the detail page
                .FirstOrDefault(h => h.HomepageId == id);
            if (homepage == null)
            {
                Console.WriteLine($"Homepage with ID {id} not found.");
                return NotFound();
            }
            return Ok(homepage);
        }

        [HttpPost]
        public IActionResult AddHomepage([FromBody] Homepage homepage)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Trim string properties and set timestamps
            homepage.Name = homepage.Name.Trim();
            if (!string.IsNullOrEmpty(homepage.Description))
            {
                homepage.Description = homepage.Description.Trim();
            }
            homepage.FeaturedProducts = homepage.FeaturedProducts.Trim();
            homepage.BannerImages = homepage.BannerImages.Trim();
            homepage.WelcomeMessage = homepage.WelcomeMessage.Trim();
            homepage.CreatedAt = DateTime.Now;
            homepage.UpdatedAt = DateTime.Now;

            // Process the Products list if present
            if (homepage.Products != null && homepage.Products.Count > 0)
            {
                var productsToAssociate = new List<Product>();
                foreach (var prod in homepage.Products)
                {
                    // Check that the product object is valid and has an Id
                    if (prod == null || prod.Id == 0)
                    {
                        return BadRequest("Invalid product data provided. Each product must have a valid Id.");
                    }
                    var existingProduct = _context.Products.Find(prod.Id);
                    if (existingProduct == null)
                    {
                        return NotFound($"Product with ID {prod.Id} not found.");
                    }
                    productsToAssociate.Add(existingProduct);
                }
                // Replace the Products list with the fully tracked entities
                homepage.Products = productsToAssociate;
            }

            _context.Homepages.Add(homepage);
            _context.SaveChanges();

            return Ok(homepage);
        }



        // PUT /Homepage/{id}
        [HttpPut("{id}")]
        public IActionResult UpdateHomepage(int id, [FromBody] Homepage homepage)
        {
            var existingHomepage = _context.Homepages.Find(id);
            if (existingHomepage == null)
            {
                return NotFound($"Homepage with ID {id} not found.");
            }

            // Update properties (trim strings and update timestamp)
            existingHomepage.Name = homepage.Name.Trim();
            existingHomepage.Description = homepage.Description?.Trim();
            existingHomepage.FeaturedProducts = homepage.FeaturedProducts.Trim();
            existingHomepage.BannerImages = homepage.BannerImages.Trim();
            existingHomepage.WelcomeMessage = homepage.WelcomeMessage.Trim();
            existingHomepage.UpdatedAt = DateTime.Now;

            _context.SaveChanges();

            Console.WriteLine($"Updated homepage record with ID: {id}");
            return Ok(existingHomepage);
        }

        // DELETE /Homepage/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteHomepage(int id)
        {
            var homepage = _context.Homepages.Find(id);
            if (homepage == null)
            {
                return NotFound($"Homepage with ID {id} not found.");
            }

            _context.Homepages.Remove(homepage);
            _context.SaveChanges();

            Console.WriteLine($"Deleted homepage record with ID: {id}");
            return Ok($"Homepage with ID {id} deleted successfully.");
        }

        // GET /Homepage/{id}/products
        [HttpGet("{id}/products")]
        public IActionResult GetHomepageProducts(int id)
        {
            var homepage = _context.Homepages
                .Include(h => h.Products)
                .FirstOrDefault(h => h.HomepageId == id);
            if (homepage == null)
            {
                return NotFound("Homepage not found.");
            }
            return Ok(homepage.Products);
        }

        // POST /Homepage/{id}/products
        [HttpPost("{id}/products")]
        public IActionResult AddProductToHomepage(int id, [FromBody] Product product)
        {
            // Retrieve the homepage with its Products collection loaded
            var homepage = _context.Homepages
                .Include(h => h.Products)
                .FirstOrDefault(h => h.HomepageId == id);
            if (homepage == null)
            {
                return NotFound("Homepage not found.");
            }

            // Instead of setting a non-existent HomepageId, add the product to the homepage's Products collection
            homepage.Products.Add(product);
            _context.SaveChanges();

            Console.WriteLine($"Added product to homepage with ID: {id}");
            return Ok(product);
        }
    }
}
