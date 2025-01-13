using Bliss.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NanoidDotNet;

namespace Bliss.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class FileController(IWebHostEnvironment environment,
        ILogger<FileController> logger) : ControllerBase
    {
        private readonly IWebHostEnvironment _environment = environment;
        private readonly ILogger<FileController> _logger = logger;

        [HttpPost("upload"), Authorize]
        [ProducesResponseType(typeof(UploadResponse), StatusCodes.Status200OK)]
        public IActionResult Upload(IFormFile file)
        {
            try
            {
                if (file.Length > 1024 * 1024)
                {
                    var message = "Maximum file size is 1MB";
                    return BadRequest(new { message });
                }

                var id = Nanoid.Generate(size: 10);
                var filename = id + Path.GetExtension(file.FileName);
                var imagePath = Path.Combine(_environment.ContentRootPath, @"wwwroot/uploads", filename);
                using var fileStream = new FileStream(imagePath, FileMode.Create);
                file.CopyTo(fileStream);
                UploadResponse response = new() { Filename = filename };
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error when upload file");
                return StatusCode(500);
            }
        }
    }
}
