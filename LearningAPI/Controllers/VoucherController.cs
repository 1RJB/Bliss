using AutoMapper;
using BlissAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BlissAPI.Controllers
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
                IQueryable<Voucher> result = _context.Vouchers.Include(t => t.User);
                if (search != null)
                {
                    result = result.Where(x => x.Title.Contains(search)
                        || x.Description.Contains(search));
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
                Voucher? voucher = _context.Vouchers.Include(t => t.User)
                    .SingleOrDefault(t => t.Id == id);
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
        [ProducesResponseType(typeof(VoucherDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult AddVoucher(AddVoucherRequest voucher)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                int userId = GetUserId();
                var now = DateTime.Now;
                Voucher myVoucher;

                switch (voucher.VoucherType)
                {
                    case VoucherType.ItemVoucher:
                        myVoucher = new ItemVoucher
                        {
                            ItemName = voucher.ItemName,
                            ItemQuantity = voucher.ItemQuantity ?? 0
                        };
                        break;
                    case VoucherType.DiscountVoucher:
                        myVoucher = new DiscountVoucher
                        {
                            DiscountPercentage = voucher.DiscountPercentage ?? 0,
                            MaxAmount = voucher.MaxAmount ?? 0
                        };
                        break;
                    case VoucherType.GiftCardVoucher:
                        myVoucher = new GiftCardVoucher
                        {
                            Value = voucher.Value ?? 0
                        };
                        break;
                    default:
                        return BadRequest("Invalid voucher type.");
                }

                myVoucher.Title = voucher.Title.Trim();
                myVoucher.Description = voucher.Description.Trim();
                myVoucher.ImageFile = voucher.ImageFile;
                myVoucher.CreatedAt = now;
                myVoucher.UpdatedAt = now;
                myVoucher.UserId = userId;
                myVoucher.Cost = voucher.Cost;
                myVoucher.ValidDuration = voucher.ValidDuration;
                myVoucher.Status = voucher.Status;
                myVoucher.MemberType = voucher.MemberType;
                myVoucher.Quantity = voucher.Quantity;
                myVoucher.VoucherType = voucher.VoucherType;
                myVoucher.ClaimedBy = null;

                _context.Vouchers.Add(myVoucher);
                _context.SaveChanges();

                Voucher? newVoucher = _context.Vouchers.Include(t => t.User)
                    .FirstOrDefault(t => t.Id == myVoucher.Id);
                VoucherDTO voucherDTO = _mapper.Map<VoucherDTO>(newVoucher);
                return Ok(voucherDTO);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when adding voucher");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}"), Authorize]
        [ProducesResponseType(typeof(VoucherDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public IActionResult UpdateVoucher(int id, UpdateVoucherRequest voucher)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var myVoucher = _context.Vouchers.Find(id);
                if (myVoucher == null)
                {
                    return NotFound();
                }

                int userId = GetUserId();
                if (myVoucher.UserId != userId)
                {
                    return Forbid();
                }

                if (voucher.Title != null)
                {
                    myVoucher.Title = voucher.Title.Trim();
                }
                if (voucher.Description != null)
                {
                    myVoucher.Description = voucher.Description.Trim();
                }
                if (voucher.ImageFile != null)
                {
                    myVoucher.ImageFile = voucher.ImageFile;
                }
                if (voucher.Status.HasValue)
                {
                    myVoucher.Status = voucher.Status.Value;
                }
                if (voucher.Cost.HasValue)
                {
                    myVoucher.Cost = voucher.Cost.Value;
                }
                if (voucher.ValidDuration.HasValue)
                {
                    myVoucher.ValidDuration = voucher.ValidDuration.Value;
                }
                if (voucher.Quantity.HasValue)
                {
                    myVoucher.Quantity = voucher.Quantity.Value;
                }
                if (voucher.MemberType.HasValue)
                {
                    myVoucher.MemberType = voucher.MemberType.Value;
                }
                if (voucher.VoucherType.HasValue)
                {
                    myVoucher.VoucherType = voucher.VoucherType.Value;
                }

                // Update specific properties based on voucher type
                switch (myVoucher)
                {
                    case ItemVoucher itemVoucher:
                        if (voucher.ItemName != null)
                        {
                            itemVoucher.ItemName = voucher.ItemName;
                        }
                        if (voucher.ItemQuantity.HasValue)
                        {
                            itemVoucher.ItemQuantity = voucher.ItemQuantity.Value;
                        }
                        break;
                    case DiscountVoucher discountVoucher:
                        if (voucher.DiscountPercentage.HasValue)
                        {
                            discountVoucher.DiscountPercentage = voucher.DiscountPercentage.Value;
                        }
                        if (voucher.MaxAmount.HasValue)
                        {
                            discountVoucher.MaxAmount = voucher.MaxAmount.Value;
                        }
                        break;
                    case GiftCardVoucher giftCardVoucher:
                        if (voucher.Value.HasValue)
                        {
                            giftCardVoucher.Value = voucher.Value.Value;
                        }
                        break;
                }

                myVoucher.UpdatedAt = DateTime.Now;

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

                int userId = GetUserId();
                if (myVoucher.UserId != userId)
                {
                    return Forbid();
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

        private int GetUserId()
        {
            return Convert.ToInt32(User.Claims
                .Where(c => c.Type == ClaimTypes.NameIdentifier)
                .Select(c => c.Value).SingleOrDefault());
        }
    }
}
