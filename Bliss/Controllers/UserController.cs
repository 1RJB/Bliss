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
using Google.Apis.Auth;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController(
        MyDbContext context,
        IConfiguration configuration,
        IMapper mapper,
        ILogger<UserController> logger,
        IOptions<SmtpSettings> smtpSettings,
        IPGeolocationService ipGeolocationService) : ControllerBase
    {
        private readonly MyDbContext _context = context;
        private readonly IConfiguration _configuration = configuration;
        private readonly IMapper _mapper = mapper;
        private readonly ILogger<UserController> _logger = logger;
        private readonly SmtpSettings _smtpSettings = smtpSettings.Value;
        private readonly IPGeolocationService _ipGeolocationService = ipGeolocationService;

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            try
            {
                // Trim string values
                request.Name = request.Name.Trim();
                request.Email = request.Email.Trim().ToLower();
                request.Password = request.Password.Trim();

                // Check if the email already exists
                var foundUser = await _context.Users.FirstOrDefaultAsync(x => x.Email == request.Email);
                if (foundUser != null)
                {
                    return BadRequest(new { message = "Email already exists." });
                }

                // Create user object
                var now = DateTime.UtcNow;
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
                var user = new User()
                {
                    Name = request.Name,
                    Email = request.Email,
                    Password = passwordHash,
                    CreatedAt = now,
                    UpdatedAt = now,
                    RewardPoints = 1000,
                    LastPasswordChangeDate = now,
                    PreviousPasswords = new List<string> { passwordHash }
                };

                // Add user
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Log activity
                await LogActivity(user.Id, "User registered", HttpContext.Connection.RemoteIpAddress.ToString());

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when user register");
                return StatusCode(500);
            }
        }

        // Google Sign-In
        [HttpPost("google-signin")]
        public async Task<IActionResult> GoogleSignIn(GoogleSignInRequest request)
        {
            var payload = await VerifyGoogleToken(request.IdToken);
            if (payload == null)
            {
                return BadRequest(new { message = "Invalid Google token." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == payload.Email);
            if (user == null)
            {
                user = new User
                {
                    Name = payload.Name,
                    Email = payload.Email,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    RewardPoints = 1000,
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            // Log activity
            await LogActivity(user.Id, "User signed in with Google", HttpContext.Connection.RemoteIpAddress.ToString());

            // Return user info
            UserDTO userDTO = _mapper.Map<UserDTO>(user);
            string accessToken = CreateToken(user);
            LoginResponse response = new() { User = userDTO, AccessToken = accessToken };
            return Ok(response);
        }

        private async Task<GoogleJsonWebSignature.Payload> VerifyGoogleToken(string idToken)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new List<string> { _configuration["Authentication:Google:ClientId"] }
                };
                var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
                return payload;
            }
            catch
            {
                return null;
            }
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            try
            {
                // Trim string values
                request.Email = request.Email.Trim().ToLower();
                request.Password = request.Password.Trim();

                // Check email and password
                var foundUser = await _context.Users.FirstOrDefaultAsync(x => x.Email == request.Email);
                if (foundUser == null)
                {
                    return BadRequest(new { message = "Email or password is not correct." });
                }

                // Check for account lockout
                if (foundUser.LockoutEnd.HasValue && foundUser.LockoutEnd.Value > DateTime.UtcNow)
                {
                    var remainingLockoutTime = foundUser.LockoutEnd.Value - DateTime.UtcNow;
                    return BadRequest(new { message = $"Account is locked. Please try again in {remainingLockoutTime.Minutes} minute(s)." });
                }

                bool verified = BCrypt.Net.BCrypt.Verify(request.Password, foundUser.Password);
                if (!verified)
                {
                    foundUser.LoginAttempts++;

                    if (foundUser.LoginAttempts >= 3)
                    {
                        foundUser.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                        foundUser.LoginAttempts = 0; // Reset attempts counter
                        await _context.SaveChangesAsync();
                        return BadRequest(new { message = $"Account has been locked for {15} minute(s) due to multiple failed attempts." });
                    }

                    await _context.SaveChangesAsync();
                    return BadRequest(new { message = $"Invalid credentials. {3 - foundUser.LoginAttempts} attempts remaining." });
                }

                // Reset login attempts on successful login
                foundUser.LoginAttempts = 0;
                foundUser.LockoutEnd = null;
                await _context.SaveChangesAsync();


                // Log activity
                await LogActivity(foundUser.Id, "User logged in", HttpContext.Connection.RemoteIpAddress.ToString());

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
                var role = User.Claims.Where(c => c.Type == ClaimTypes.Role)
                    .Select(c => c.Value).SingleOrDefault();
                var points = User.Claims.Where(c => c.Type == "RewardPoints")
                    .Select(c => c.Value).SingleOrDefault();

                if (id != 0 && name != null && email != null)
                {
                    UserDTO userDTO = new() { Id = id, Name = name, Email = email, Role = role, RewardPoints = points };
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
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await _context.Users.ToListAsync();
            var userDTOs = _mapper.Map<List<UserDTO>>(users);
            return Ok(userDTOs);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDTO>> GetUser(int id)
        {
            // Authorization: Ensure the user is accessing their own account
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || int.Parse(userIdClaim) != id)
            {
                return Forbid();
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            var userDTO = _mapper.Map<UserDTO>(user);
            return Ok(userDTO);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserRequest request)
        {
            // Authorization: Ensure the user is updating their own account
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || int.Parse(userIdClaim) != id)
            {
                return Forbid();
            }

            if (id != request.Id)
            {
                return BadRequest("User ID mismatch.");
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Update user properties
            user.Name = request.Name.Trim();
            user.Email = request.Email.Trim().ToLower();
            user.UpdatedAt = DateTime.UtcNow;
            user.RewardPoints = request.RewardPoints;

            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                // Log activity
                await LogActivity(user.Id, "User updated", HttpContext.Connection.RemoteIpAddress.ToString());

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin,staff,client")]
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

                // Log activity
                await LogActivity(user.Id, "User deleted", HttpContext.Connection.RemoteIpAddress.ToString());

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPut("{id}/changePassword")]
        [Authorize(Roles = "admin,staff,client")]
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

            // Authorization check
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || user.Id != int.Parse(userIdClaim))
            {
                return Unauthorized();
            }

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
            {
                return BadRequest("Current password is incorrect.");
            }

            // Check password history
            if (user.PreviousPasswords.Any(hash => BCrypt.Net.BCrypt.Verify(request.NewPassword, hash)))
            {
                return BadRequest($"Cannot reuse any of your last 3 passwords.");
            }

            // Hash new password
            string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            // Update password history
            user.PreviousPasswords.Add(newPasswordHash);
            if (user.PreviousPasswords.Count > 3)
            {
                user.PreviousPasswords.RemoveAt(0);
            }

            // Update password
            user.Password = newPasswordHash;
            user.LastPasswordChangeDate = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                await LogActivity(user.Id, "Password changed", HttpContext.Connection.RemoteIpAddress.ToString());
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLower().Trim());
                if (user == null)
                {
                    // Don't reveal that the user doesn't exist
                    return Ok(new { message = "If your email is registered, you will receive a reset link." });
                }

                // Generate reset token
                var token = Guid.NewGuid().ToString();
                user.PasswordResetToken = token;
                user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(5);
                await _context.SaveChangesAsync();

                // Get frontend URL from configuration
                var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
                var resetLink = $"{frontendUrl}/reset-password?token={token}";

                // Send email
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
                    Subject = "Password Reset Request",
                    Body = $@"
                <html>
                    <body>
                        <h2>Password Reset Request</h2>
                        <p>You requested to reset your password. Click the link below to proceed:</p>
                        <p><a href='{resetLink}'>{resetLink}</a></p>
                        <p>This link will expire in 5 minutes.</p>
                        <p>If you did not request this password reset, please ignore this email.</p>
                    </body>
                </html>",
                    IsBodyHtml = true,
                };
                mailMessage.To.Add(request.Email);

                await smtpClient.SendMailAsync(mailMessage);

                // Log activity
                await LogActivity(user.Id, "Password reset requested", HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");

                return Ok(new { message = "If your email is registered, you will receive a reset link." });
            }
            catch (SmtpException smtpEx)
            {
                _logger.LogError(smtpEx, "SMTP error when sending password reset email.");
                return StatusCode(500, "Error sending password reset email.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in forgot password process.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == request.ResetToken);

                if (user == null || !user.PasswordResetTokenExpiry.HasValue ||
                    user.PasswordResetTokenExpiry.Value < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Invalid or expired reset token." });
                }

                // Check password history
                if (user.PreviousPasswords.Any(hash => BCrypt.Net.BCrypt.Verify(request.NewPassword, hash)))
                {
                    return BadRequest(new { message = "Cannot reuse any of your last 3 passwords." });
                }

                // Hash new password
                string newPasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

                // Update password history
                user.PreviousPasswords.Add(newPasswordHash);
                if (user.PreviousPasswords.Count > 3)
                {
                    user.PreviousPasswords.RemoveAt(0);
                }

                // Update user
                user.Password = newPasswordHash;
                user.PasswordResetToken = null;
                user.PasswordResetTokenExpiry = null;
                user.LastPasswordChangeDate = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Log activity
                await LogActivity(user.Id, "Password reset completed", HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown");

                return Ok(new { message = "Password has been reset successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in reset password process.");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}/activityLogs")]
        [Authorize(Roles = "admin,staff,client")]
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
                // Check if the email already exists
                var foundUser = await _context.Users.FirstOrDefaultAsync(x => x.Email == email.ToLower().Trim());
                if (foundUser != null)
                {
                    return BadRequest(new { message = "Email already exists." });
                }

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
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role),
                }),
                Expires = DateTime.UtcNow.AddDays(tokenExpiresDays),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            string token = tokenHandler.WriteToken(securityToken);

            return token;
        }

        private async Task LogActivity(int userId, string action, string ipAddress)
        {
            // Check if the IP address is a local address and set a mock IP address
            if (ipAddress == "::1" || ipAddress == "127.0.0.1")
            {
                ipAddress = "8.8.8.8";
            }

            var geolocation = await _ipGeolocationService.GetGeolocation(ipAddress);

            _logger.LogInformation($"Geolocation for IP {ipAddress}: {geolocation.City}, {geolocation.Country}, {geolocation.Latitude}, {geolocation.Longitude}");

            var activityLog = new ActivityLog
            {
                UserId = userId,
                Action = action,
                Timestamp = DateTime.UtcNow,
                IpAddress = ipAddress,
                Location = $"{geolocation.City}, {geolocation.Country}",
                Latitude = geolocation.Latitude,
                Longitude = geolocation.Longitude
            };

            _context.ActivityLogs.Add(activityLog);
            await _context.SaveChangesAsync();
        }
    }
}