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

            // Create a new UserVoucher using values from the voucher
            var userVoucher = new UserVoucher
            {
                Title = voucher.Title,
                Description = voucher.Description,
                ImageFile = voucher.ImageFile,
                Value = voucher.Value,
                ClaimedAt = DateTime.UtcNow,
                ValidTill = voucher.ValidTill,
                Code = code,
                IsUsed = false,
                UserId = userId
            };

            _context.UserVouchers.Add(userVoucher);
            await _context.SaveChangesAsync();

            return Ok(userVoucher);
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
