using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NanoidDotNet;

namespace BodyShop_Assign1_2.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class FileController(IWebHostEnvironment enviroment) : ControllerBase
    {
        private readonly IWebHostEnvironment _environment = enviroment;

        [HttpPost("upload"), Authorize]
        public IActionResult Upload(IFormFile file)
        {
            if (file.Length > 1024 * 1024)
            {
                var message = "Maximum file size is 1MB";
                return BadRequest(new { message });
            }
            var id = Nanoid.Generate(size: 10);
            var filename = id + Path.GetExtension(file.FileName);
            var imagePath = Path.Combine(_environment.ContentRootPath,
            @"wwwroot/uploads", filename);
            using var fileStream = new FileStream(imagePath, FileMode.Create);
            file.CopyTo(fileStream);
            return Ok(new { filename });
        }
    }
}
