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

        [HttpPost]
        [ProducesResponseType(typeof(VoucherDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult AddVoucher([FromBody] Voucher voucher)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                Voucher myVoucher;

                // Determine the correct voucher type and set specific properties
                if (voucher is ItemVoucher itemVoucher)
                {
                    myVoucher = new ItemVoucher
                    {
                        ItemName = itemVoucher.ItemName,
                        ItemQuantity = itemVoucher.ItemQuantity
                    };
                }
                else if (voucher is DiscountVoucher discountVoucher)
                {
                    myVoucher = new DiscountVoucher
                    {
                        DiscountPercentage = discountVoucher.DiscountPercentage,
                        MaxAmount = discountVoucher.MaxAmount
                    };
                }
                else if (voucher is GiftCardVoucher giftCardVoucher)
                {
                    myVoucher = new GiftCardVoucher
                    {
                        Value = giftCardVoucher.Value
                    };
                }
                else
                {
                    return BadRequest("Invalid voucher type.");
                }

                // Assign common voucher properties
                myVoucher.Title = voucher.Title;
                myVoucher.Description = voucher.Description;
                myVoucher.Cost = voucher.Cost;
                myVoucher.ValidDuration = voucher.ValidDuration;
                myVoucher.Status = VoucherStatus.Available;
                myVoucher.MemberType = voucher.MemberType;
                myVoucher.Quantity = voucher.Quantity;
                myVoucher.VoucherType = voucher.VoucherType;
                myVoucher.CreatedAt = DateTime.UtcNow;
                myVoucher.UpdatedAt = DateTime.UtcNow;

                // Save the voucher
                _context.Vouchers.Add(myVoucher);
                _context.SaveChanges();

                return Ok(myVoucher);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when adding voucher");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(VoucherDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public IActionResult UpdateVoucher(int id, UpdateVoucherRequest voucher)
        {
            try
            {
                var myVoucher = _context.Vouchers.Find(id);
                if (myVoucher == null)
                {
                    return NotFound();
                }

                _mapper.Map(voucher, myVoucher);
                myVoucher.Title = voucher.Title = "";
                myVoucher.Description = voucher.Description = "";
                myVoucher.Cost = voucher.Cost ?? 0;
                myVoucher.ValidDuration = voucher.ValidDuration ?? 0;
                myVoucher.MemberType = voucher.MemberType ?? 0;
                myVoucher.Quantity = voucher.Quantity ?? 0;
                myVoucher.UpdatedAt = DateTime.UtcNow;
                _context.SaveChanges();

                VoucherDTO updatedVoucherDTO = _mapper.Map<VoucherDTO>(myVoucher);
                return Ok(updatedVoucherDTO);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when updating voucher");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("update-status")]
        public async Task<IActionResult> UpdateVoucherStatus()
        {
            var vouchers = await _context.Vouchers.ToListAsync();

            foreach (var voucher in vouchers)
            {
                // Expire vouchers after ValidDuration days
                if (voucher.Status == VoucherStatus.Available &&
                    (voucher.CreatedAt.AddDays(voucher.ValidDuration) < DateTime.UtcNow))
                {
                    voucher.Status = VoucherStatus.Expired;
                }

                // Redeem the voucher when quantity reaches zero
                if (voucher.Quantity <= 0 && voucher.Status != VoucherStatus.Redeemed)
                {
                    voucher.Status = VoucherStatus.Redeemed;
                }

                _context.Vouchers.Update(voucher);
            }

            await _context.SaveChangesAsync();
            return Ok("Voucher statuses updated successfully.");
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
