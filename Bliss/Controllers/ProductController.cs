﻿using Microsoft.AspNetCore.Mvc;
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


        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Product>), StatusCodes.Status200OK)]
        public IActionResult GetAll(string? search)
        {
            IQueryable<Product> result = _context.Products.Include(t => t.User);
            var list = result.OrderByDescending(x => x.Price).ToList();
            var data = list.Select(t => new
            {
                t.Id,
                t.Name,
                t.Description,
                t.ImageFile,
                t.Price,
                t.UserId,
                User = new
                {
                    t.User?.Name
                }
            }
            );
            return Ok(data);
        }

        [HttpPost, Authorize]
        public IActionResult AddProdut(Product product)
        {
            int userId = GetUserId();
            var myProduct = new Product()
            {
                Name = product.Name.Trim(),
                Description = product.Description.Trim(),
                Price = product.Price,
                ImageFile = product.ImageFile,
                UserId = userId,

            };
            _context.Products.Add(myProduct);
            _context.SaveChanges();

            return Ok(myProduct);
        }

        [HttpGet("{id}")]
        public IActionResult GetProduct(int id)
        {
            Product? product = _context.Products.Include(t => t.User).SingleOrDefault(t => t.Id == id);
            if (product == null)
            {
                return NotFound();
            }
            var data = new
            {
                product.Id,
                product.Name,
                product.Description,
                product.ImageFile,
                product.UserId,
                User = new
                {
                    product.User?.Name
                }
            };

            return Ok(data);

        }

        [HttpPut("{id}"), Authorize]
        public IActionResult UpdateProduct(int id, Product product)
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

            myProduct.Name = product.Name.Trim();
            myProduct.Description = product.Description.Trim();
            myProduct.ImageFile = product.ImageFile;
            myProduct.Price = product.Price;

            _context.SaveChanges();
            return Ok();
        }
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
                .Select(c => c.Value).SingleOrDefault());

        }
    }
}
