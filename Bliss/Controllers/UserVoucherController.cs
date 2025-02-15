using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Bliss.Models;
using System.Security.Claims;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserVoucherController : ControllerBase
    {
        private readonly MyDbContext _context;

        public UserVoucherController(MyDbContext context)
        {
            _context = context;
        }

        [HttpPost("redeem/{voucherId}"), Authorize]
        public IActionResult RedeemVoucher(int voucherId)
        {
            int userId = GetUserId();

            var voucher = _context.Vouchers.Find(voucherId);
            if (voucher == null)
            {
                return NotFound(new { message = "Voucher not found." });
            }

            if (voucher.Quantity <= 0)
            {
                return BadRequest(new { message = "Voucher is out of stock." });
            }

            // Generate unique voucher code
            string code;
            do
            {
                code = GenerateVoucherCode();
            }
            while (_context.UserVouchers.Any(uv => uv.Code == code));

            // Create UserVoucher record
            var userVoucher = new UserVoucher
            {
                UserId = userId,
                VoucherId = voucher.Id,
                Title = voucher.Title,
                Description = voucher.Description,
                VoucherType = voucher.VoucherType,
                Code = code,
                ClaimedAt = DateTime.UtcNow,
                Duration = voucher.ValidDuration,
                isValid = true
            };

            // Copy subclass-specific fields (if applicable)
            if (voucher is ItemVoucher itemVoucher)
            {
                userVoucher.ItemName = itemVoucher.ItemName;
                userVoucher.ItemQuantity = itemVoucher.ItemQuantity;
            }
            else if (voucher is DiscountVoucher discountVoucher)
            {
                userVoucher.DiscountPercentage = discountVoucher.DiscountPercentage;
                userVoucher.MaxAmount = discountVoucher.MaxAmount;
            }
            else if (voucher is GiftCardVoucher giftCardVoucher)
            {
                userVoucher.Value = giftCardVoucher.Value;
            }

            _context.UserVouchers.Add(userVoucher);

            // ✅ Update the Voucher's Quantity & Status
            voucher.Quantity -= 1; // Reduce quantity by 1

            if (voucher.Quantity == 0)
            {
                voucher.Status = VoucherStatus.Redeemed; // Mark as Redeemed if no stock left
            }

            // ✅ Save both UserVoucher and Voucher changes
            _context.SaveChanges();

            return Ok(new { message = "Voucher redeemed successfully!", userVoucher });
        }



        [HttpGet, Authorize]
        public IActionResult GetUserVouchers()
        {
            int userId = GetUserId();
            var vouchers = _context.UserVouchers
                .Where(uv => uv.UserId == userId)
                .Select(uv => new UserVoucherDTO
                {
                    VoucherId = uv.VoucherId??0,  // Nullable in case the voucher was deleted
                    Title = uv.Title,
                    Description = uv.Description,
                    VoucherType = uv.VoucherType,
                    Code = uv.Code,
                    UserId = uv.UserId,
                    ClaimedAt = uv.ClaimedAt,
                    isValid = uv.isValid,
                    Duration = uv.Duration,

                    // Subclass-Specific Fields
                    ItemName = uv.ItemName,
                    ItemQuantity = uv.ItemQuantity,
                    DiscountPercentage = uv.DiscountPercentage,
                    MaxAmount = uv.MaxAmount,
                    Value = uv.Value
                })
                .ToList();

            return Ok(vouchers);
        }

        // Search for a specific voucher
        [HttpGet("search"), Authorize]
        public IActionResult SearchUserVouchers(string query)
        {
            int userId = GetUserId();
            var vouchers = _context.UserVouchers
                .Where(uv => uv.UserId == userId &&
                            (uv.Title.Contains(query) || uv.Description.Contains(query) || uv.Code.Contains(query)))
                .Select(uv => new UserVoucherDTO
                {
                    VoucherId = uv.VoucherId ?? 0,  // Nullable in case the voucher was deleted
                    Title = uv.Title,
                    Description = uv.Description,
                    VoucherType = uv.VoucherType,
                    Code = uv.Code,
                    UserId = uv.UserId,
                    ClaimedAt = uv.ClaimedAt,
                    isValid = uv.isValid,
                    Duration = uv.Duration,

                    // Subclass-Specific Fields
                    ItemName = uv.ItemName,
                    ItemQuantity = uv.ItemQuantity,
                    DiscountPercentage = uv.DiscountPercentage,
                    MaxAmount = uv.MaxAmount,
                    Value = uv.Value
                })
                .ToList();

            return Ok(vouchers);
        }

        // Check and expire vouchers, delete if isValid is false
        [HttpGet("update-expired")]
        public async Task<IActionResult> ExpireVouchers()
        {
            var userVouchers = await _context.UserVouchers.ToListAsync();

            foreach (var userVoucher in userVouchers)
            {
                if (userVoucher.isValid && userVoucher.ClaimedAt.AddDays(userVoucher.Duration) < DateTime.UtcNow)
                {
                    userVoucher.isValid = false; // Mark as invalid
                }
            }

            // Remove all invalid vouchers
            var expiredVouchers = userVouchers.Where(uv => !uv.isValid).ToList();
            if (expiredVouchers.Any())
            {
                _context.UserVouchers.RemoveRange(expiredVouchers);
                await _context.SaveChangesAsync();
            }

            return Ok("Expired vouchers removed.");
        }

        private int GetUserId()
        {
            return Convert.ToInt32(User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value);
        }

        private static string GenerateVoucherCode()
        {
            var random = new Random();
            const string letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string digits = "0123456789";

            string lettersPart = new string(Enumerable.Repeat(letters, 2)
                .Select(s => s[random.Next(s.Length)]).ToArray());

            string digitsPart = new string(Enumerable.Repeat(digits, 3)
                .Select(s => s[random.Next(s.Length)]).ToArray());

            return lettersPart + digitsPart;
        }
    }
}
