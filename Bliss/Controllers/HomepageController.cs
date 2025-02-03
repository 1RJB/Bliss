﻿using Microsoft.AspNetCore.Mvc;
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
                query = query.Where(h => h.WelcomeMessage.Contains(search) ||
                                         h.FeaturedProducts.Contains(search) ||
                                         h.BannerImages.Contains(search));
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
            var homepage = _context.Homepages.Find(id);
            if (homepage == null)
            {
                Console.WriteLine($"Homepage with ID {id} not found.");
                return NotFound();
            }
            return Ok(homepage);
        }

        [HttpPost]
        public IActionResult AddHomepage([FromBody] HomepageCreateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var now = DateTime.Now;
            var homepage = new Homepage
            {
                FeaturedProducts = dto.FeaturedProducts.Trim(),
                BannerImages = dto.BannerImages.Trim(),
                WelcomeMessage = dto.WelcomeMessage.Trim(),
                CreatedAt = now,
                UpdatedAt = now
            };

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

            existingHomepage.WelcomeMessage = homepage.WelcomeMessage.Trim();
            existingHomepage.FeaturedProducts = homepage.FeaturedProducts.Trim();
            existingHomepage.BannerImages = homepage.BannerImages.Trim();
            existingHomepage.UpdatedAt = DateTime.Now;

            _context.Homepages.Update(existingHomepage);
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
            var homepage = _context.Homepages.Find(id);
            if (homepage == null)
            {
                return NotFound("Homepage not found.");
            }

            // Associate product with the homepage
            product.HomepageId = id;
            _context.Products.Add(product);
            _context.SaveChanges();
            Console.WriteLine($"Added product to homepage with ID: {id}");
            return Ok(product);
        }
    }
}
