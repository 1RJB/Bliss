using AutoMapper;
using Bliss.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Net;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly MyDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly ILogger<UserController> _logger;
        private readonly SmtpSettings _smtpSettings;

        public UserController(
            MyDbContext context,
            IConfiguration configuration,
            IMapper mapper,
            ILogger<UserController> logger,
            IOptions<SmtpSettings> smtpSettings)
        {
            _context = context;
            _configuration = configuration;
            _mapper = mapper;
            _logger = logger;
            _smtpSettings = smtpSettings.Value;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            try
            {
                // Trim string values
                request.Name = request.Name.Trim();
                request.Email = request.Email.Trim().ToLower();
                request.Password = request.Password.Trim();
                request.Otp = request.Otp.Trim();

                // Check if the email already exists
                var foundUser = await _context.Users.FirstOrDefaultAsync(x => x.Email == request.Email);
                if (foundUser != null)
                {
                    return BadRequest(new { message = "Email already exists." });
                }

                // Verify OTP
                var otpRecord = await _context.OtpRecords
                    .FirstOrDefaultAsync(x => x.Email == request.Email && x.Otp == request.Otp);

                if (otpRecord == null || otpRecord.ExpiresAt < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Invalid or expired OTP." });
                }

                // OTP is valid, remove it from the database
                _context.OtpRecords.Remove(otpRecord);
                await _context.SaveChangesAsync();

                // Create user object
                var now = DateTime.UtcNow;
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                var user = new User()
                {
                    Name = request.Name,
                    Email = request.Email,
                    Password = passwordHash,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                // Add user
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when user register");
                return StatusCode(500);
            }
        }


        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        public IActionResult Login(LoginRequest request)
        {
            try
            {
                // Trim string values
                request.Email = request.Email.Trim().ToLower();
                request.Password = request.Password.Trim();

                // Check email and password
                string message = "Email or password is not correct.";
                var foundUser = _context.Users.Where(x => x.Email == request.Email).FirstOrDefault();
                if (foundUser == null)
                {
                    return BadRequest(new { message });
                }
                bool verified = BCrypt.Net.BCrypt.Verify(request.Password, foundUser.Password);
                if (!verified)
                {
                    return BadRequest(new { message });
                }

                // Return user info
                UserDTO userDTO = _mapper.Map<UserDTO>(foundUser);
                string accessToken = CreateToken(foundUser);
                LoginResponse response = new() { User = userDTO, AccessToken = accessToken };
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when user login");
                return StatusCode(500);
            }
        }

        [HttpGet("auth"), Authorize]
        [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
        public IActionResult Auth()
        {
            try
            {
                var id = Convert.ToInt32(User.Claims.Where(c => c.Type == ClaimTypes.NameIdentifier)
                .Select(c => c.Value).SingleOrDefault());
                var name = User.Claims.Where(c => c.Type == ClaimTypes.Name)
                    .Select(c => c.Value).SingleOrDefault();
                var email = User.Claims.Where(c => c.Type == ClaimTypes.Email)
                    .Select(c => c.Value).SingleOrDefault();

                if (id != 0 && name != null && email != null)
                {
                    UserDTO userDTO = new() { Id = id, Name = name, Email = email };
                    AuthResponse response = new() { User = userDTO };
                    return Ok(response);
                }
                else
                {
                    return Unauthorized();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when user auth");
                return StatusCode(500);
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await _context.Users.ToListAsync();
            var userDTOs = _mapper.Map<List<UserDTO>>(users);
            return Ok(userDTOs);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            var userDTO = _mapper.Map<UserDTO>(user);
            return Ok(userDTO);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserRequest request)
        {
            if (id != request.Id)
            {
                return BadRequest("User ID mismatch.");
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Authorization: Ensure the user is updating their own account
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }
            var userIdFromToken = int.Parse(userIdClaim);
            if (user.Id != userIdFromToken)
            {
                return Forbid();
            }

            // Update user properties
            user.Name = request.Name.Trim();
            user.Email = request.Email.Trim().ToLower();
            user.UpdatedAt = DateTime.UtcNow;

            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Authorization: Ensure the user is deleting their own account
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }
            var userIdFromToken = int.Parse(userIdClaim);
            if (user.Id != userIdFromToken)
            {
                return Forbid();
            }

            try
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}/changePassword")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(int id, ChangePasswordRequest request)
        {
            if (id != request.Id)
            {
                return BadRequest("User ID mismatch.");
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Authorization: Ensure the user is changing their own password
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }
            var userIdFromToken = int.Parse(userIdClaim);
            if (user.Id != userIdFromToken)
            {
                return Forbid();
            }

            // Verify current password
            bool verified = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password);
            if (!verified)
            {
                return BadRequest("Current password is incorrect.");
            }

            // Hash new password
            string newHashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.Password = newHashedPassword;
            user.UpdatedAt = DateTime.UtcNow;

            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}/activityLogs")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ActivityLogDTO>>> GetUserActivityLogs(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Authorization: Ensure the user is accessing their own logs
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }
            var userIdFromToken = int.Parse(userIdClaim);
            if (user.Id != userIdFromToken)
            {
                return Forbid();
            }

            var activityLogs = await _context.ActivityLogs
                .Where(log => log.UserId == id)
                .ToListAsync();

            var activityLogDTOs = _mapper.Map<List<ActivityLogDTO>>(activityLogs);

            return Ok(activityLogDTOs);
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromQuery] string email)
        {
            try
            {
                // Validate email
                var foundUser = await _context.Users.FirstOrDefaultAsync(x => x.Email == email.ToLower().Trim());
                if (foundUser != null)
                {
                    return BadRequest(new { message = "Email already exists." });
                }

                // Generate OTP
                var otp = new Random().Next(100000, 999999).ToString();

                // Store OTP in cache or database (example using DbContext)
                var otpRecord = new OtpRecord
                {
                    Email = email.ToLower().Trim(),
                    Otp = otp,
                    ExpiresAt = DateTime.UtcNow.AddMinutes(5)
                };
                _context.OtpRecords.Add(otpRecord);
                await _context.SaveChangesAsync();

                // Send email (SMTP setup required)
                var smtpClient = new SmtpClient(_smtpSettings.Server)
                {
                    Port = _smtpSettings.Port,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(_smtpSettings.SenderEmail, _smtpSettings.SenderPassword),
                    EnableSsl = _smtpSettings.EnableSsl,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_smtpSettings.SenderEmail ?? throw new ArgumentNullException(nameof(_smtpSettings.SenderEmail))),
                    Subject = "Bliss Registration OTP Code",
                    Body = $"Your OTP code is: {otp}. It expires in 5 minutes.",
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(email);

                await smtpClient.SendMailAsync(mailMessage);

                return Ok(new { message = "OTP sent successfully." });
            }
            catch (SmtpException smtpEx)
            {
                _logger.LogError(smtpEx, "SMTP error when sending OTP.");
                return StatusCode(500, "SMTP error when sending OTP.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when sending OTP.");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(string email, string otp)
        {
            try
            {
                var otpRecord = await _context.OtpRecords
                    .FirstOrDefaultAsync(x => x.Email == email.ToLower().Trim() && x.Otp == otp);

                if (otpRecord == null || otpRecord.ExpiresAt < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Invalid or expired OTP." });
                }

                // OTP is valid, remove it from the database or cache
                _context.OtpRecords.Remove(otpRecord);
                await _context.SaveChangesAsync();

                return Ok(new { message = "OTP verified successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when verifying OTP.");
                return StatusCode(500, "Internal server error.");
            }
        }

        private string CreateToken(User user)
        {
            string? secret = _configuration.GetValue<string>("Authentication:Secret");
            if (string.IsNullOrEmpty(secret))
            {
                throw new Exception("Secret is required for JWT authentication.");
            }

            int tokenExpiresDays = _configuration.GetValue<int>("Authentication:TokenExpiresDays");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(secret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Email, user.Email)
                ]),
                Expires = DateTime.UtcNow.AddDays(tokenExpiresDays),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            string token = tokenHandler.WriteToken(securityToken);

            return token;
        }
    }
}