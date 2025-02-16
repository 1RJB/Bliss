using System.Security.Claims;
using AutoMapper;
using Bliss.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class VoucherController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<VoucherController> _logger;

        public VoucherController(MyDbContext context, IMapper mapper, ILogger<VoucherController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<VoucherDTO>), StatusCodes.Status200OK)]
        public IActionResult GetAll(string? search)
        {
            try
            {
                IQueryable<Voucher> result = _context.Vouchers;
                if (!string.IsNullOrEmpty(search))
                {
                    result = result.Where(x => x.Title.Contains(search) || x.Description.Contains(search));
                }
                var list = result.OrderByDescending(x => x.CreatedAt).ToList();
                IEnumerable<VoucherDTO> data = list.Select(_mapper.Map<VoucherDTO>);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when getting all vouchers");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(VoucherDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetVoucher(int id)
        {
            try
            {
                Voucher? voucher = _context.Vouchers.SingleOrDefault(t => t.Id == id);
                if (voucher == null)
                {
                    return NotFound();
                }
                VoucherDTO data = _mapper.Map<VoucherDTO>(voucher);
                return Ok(data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when getting voucher by id");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost, Authorize]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult AddVoucher([FromBody] Voucher voucher)
        {
            var myVoucher = new Voucher
            {
                Title = voucher.Title,
                Description = voucher.Description,
                Cost = voucher.Cost,
                ValidTill = voucher.ValidTill,
                Status = VoucherStatus.Available,
                Quantity = voucher.Quantity,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                ImageFile = voucher.ImageFile,
                Value = voucher.Value,
            };
                // Save the voucher
                _context.Vouchers.Add(myVoucher);
                _context.SaveChanges();
                return Ok(myVoucher);
           
        }

        [HttpPut("{id}"), Authorize]
        [ProducesResponseType(typeof(VoucherDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public IActionResult UpdateVoucher(int id, [FromBody] Voucher voucher)
        {
            var myVoucher = _context.Vouchers.FirstOrDefault(v => v.Id == id);
            if (myVoucher == null)
                return NotFound();

            myVoucher.Title = voucher.Title.Trim();
            myVoucher.Description = voucher.Description.Trim();
            myVoucher.ImageFile = voucher.ImageFile;
            myVoucher.Cost = voucher.Cost;
            myVoucher.ValidTill = voucher.ValidTill;
            myVoucher.Status = voucher.Status;
            myVoucher.Quantity = voucher.Quantity;
            myVoucher.Value = voucher.Value;
            myVoucher.UpdatedAt = DateTime.UtcNow;

            _context.SaveChanges();
            return Ok(myVoucher);
        }

        [HttpDelete("{id}"), Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public IActionResult DeleteVoucher(int id)
        {
            try
            {
                var myVoucher = _context.Vouchers.Find(id);
                if (myVoucher == null)
                {
                    return NotFound();
                }

                _context.Vouchers.Remove(myVoucher);
                _context.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when deleting voucher");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
