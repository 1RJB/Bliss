using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Bliss.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpPost("redeem/{voucherId}")]
        [Authorize]
        public async Task<IActionResult> RedeemVoucher(int voucherId)
        {
            // Use the helper method to get the user id as an int.
            int userId = GetUserId();

            // Retrieve the voucher by its id
            var voucher = await _context.Vouchers.FindAsync(voucherId);
            if (voucher == null)
            {
                return NotFound("Voucher not found.");
            }

            // Generate a unique voucher code in the format LLDDD (2 letters and 3 digits)
            string code;
            Random random = new Random();
            bool codeExists;
            do
            {
                code = GenerateVoucherCode(random);
                codeExists = await _context.UserVouchers.AnyAsync(uv => uv.Code == code);
            } while (codeExists);

            // Set ClaimedAt to the current time and ValidTill to 30 days after claimed.
            DateTime claimedAt = DateTime.UtcNow;
            DateTime validTill = claimedAt.AddDays(30);

            // Create a new UserVoucher using values from the voucher
            var userVoucher = new UserVoucher
            {
                Title = voucher.Title,
                Description = voucher.Description,
                ImageFile = voucher.ImageFile,
                Value = voucher.Value,
                ClaimedAt = claimedAt,
                ValidTill = validTill,
                Code = code,
                IsUsed = false,
                UserId = userId
            };

            voucher.Quantity--;

            if (voucher.Quantity == 0)
            {
                voucher.Status = VoucherStatus.Redeemed;
            }

            _context.UserVouchers.Add(userVoucher);
            await _context.SaveChangesAsync();

            return Ok(userVoucher);
        }

        [HttpGet("seemyvouchers")]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<UserVoucherDTO>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllUserVouchers()
        {
            try
            {
                // Retrieve the current user's id
                int userId = GetUserId();

                // Query UserVouchers by the user's id
                var userVouchers = await _context.UserVouchers
                    .Where(uv => uv.UserId == userId)
                    .OrderByDescending(uv => uv.ClaimedAt)
                    .ToListAsync();

                // Optionally, map your UserVoucher entities to a DTO if desired:
                // IEnumerable<UserVoucherDTO> data = userVouchers.Select(_mapper.Map<UserVoucherDTO>);
                // For simplicity, we're returning the entities directly here.

                return Ok(userVouchers);
            }
            catch (Exception ex)
            {
                // Log the error as needed
                return StatusCode(500, "Internal server error");
            }
        }


        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUserVoucher(int id)
        {
            // Get the current user's id
            int userId = GetUserId();

            // Retrieve the UserVoucher by its id
            var userVoucher = await _context.UserVouchers.FindAsync(id);
            if (userVoucher == null)
            {
                return NotFound("User voucher not found.");
            }

            // Check if the voucher belongs to the current user or if the user is an admin
            if (userVoucher.UserId != userId && !User.IsInRole("admin"))
            {
                return Forbid("You are not authorized to delete this voucher.");
            }

            _context.UserVouchers.Remove(userVoucher);
            await _context.SaveChangesAsync();

            return Ok("User voucher deleted successfully.");
        }


        private int GetUserId()
        {
            return Convert.ToInt32(User.Claims
                .Where(c => c.Type == ClaimTypes.NameIdentifier)
                .Select(c => c.Value)
                .SingleOrDefault());
        }

        private string GenerateVoucherCode(Random random)
        {
            const string letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            // Generate two random letters
            string letterPart = new string(Enumerable.Range(0, 2)
                .Select(_ => letters[random.Next(letters.Length)])
                .ToArray());
            // Generate three random digits (ensuring 3-digit number with possible leading zeros)
            string digitPart = random.Next(0, 1000).ToString("D3");
            return letterPart + digitPart;
        }
    }
}
