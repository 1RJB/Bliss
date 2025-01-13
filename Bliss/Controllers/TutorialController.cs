using AutoMapper;
using Bliss.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProductController(MyDbContext context, IMapper mapper,
        ILogger<ProductController> logger) : ControllerBase
    {
        private readonly MyDbContext _context = context;
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<ProductController> _logger = logger;

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProductDTO>), StatusCodes.Status200OK)]
        public IActionResult GetAll(string? search)
        {
            try
            {
                IQueryable<Product> result = _context.Products.Include(t => t.User);
                if (search != null)
                {
                    result = result.Where(x => x.Title.Contains(search)
                        || x.Description.Contains(search));
                }
                var list = result.OrderByDescending(x => x.CreatedAt).ToList();
                IEnumerable<ProductDTO> data = list.Select(_mapper.Map<ProductDTO>);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when get all products");
                return StatusCode(500);
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProductDTO), StatusCodes.Status200OK)]
        public IActionResult GetProduct(int id)
        {
            try
            {
                Product? product = _context.Products.Include(t => t.User)
                .SingleOrDefault(t => t.Id == id);
                if (product == null)
                {
                    return NotFound();
                }
                ProductDTO data = _mapper.Map<ProductDTO>(product);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when get product by id");
                return StatusCode(500);
            }
        }

        [HttpPost, Authorize]
        [ProducesResponseType(typeof(ProductDTO), StatusCodes.Status200OK)]
        public IActionResult AddProduct(AddProductRequest product)
        {
            try
            {
                int userId = GetUserId();
                var now = DateTime.Now;
                var myProduct = new Product()
                {
                    Title = product.Title.Trim(),
                    Description = product.Description.Trim(),
                    ImageFile = product.ImageFile,
                    CreatedAt = now,
                    UpdatedAt = now,
                    UserId = userId
                };

                _context.Products.Add(myProduct);
                _context.SaveChanges();

                Product? newProduct = _context.Products.Include(t => t.User)
                    .FirstOrDefault(t => t.Id == myProduct.Id);
                ProductDTO productDTO = _mapper.Map<ProductDTO>(newProduct);
                return Ok(productDTO);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when add product");
                return StatusCode(500);
            }
        }

        [HttpPut("{id}"), Authorize]
        public IActionResult UpdateProduct(int id, UpdateProductRequest product)
        {
            try
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

                if (product.Title != null)
                {
                    myProduct.Title = product.Title.Trim();
                }
                if (product.Description != null)
                {
                    myProduct.Description = product.Description.Trim();
                }
                if (product.ImageFile != null)
                {
                    myProduct.ImageFile = product.ImageFile;
                }
                myProduct.UpdatedAt = DateTime.Now;

                _context.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when update product");
                return StatusCode(500);
            }
        }

        [HttpDelete("{id}"), Authorize]
        public IActionResult DeleteProduct(int id)
        {
            try
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

                _context.Products.Remove(myProduct);
                _context.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when delete product");
                return StatusCode(500);
            }
        }

        private int GetUserId()
        {
            return Convert.ToInt32(User.Claims
                .Where(c => c.Type == ClaimTypes.NameIdentifier)
                .Select(c => c.Value).SingleOrDefault());
        }
    }
}
