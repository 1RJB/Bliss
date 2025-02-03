using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace Bliss.Controllers
{
    [ApiController]
    [Route("currency")]  // ✅ Ensure this matches your frontend route
    public class CurrencyController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public CurrencyController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpGet("convert")]
        public async Task<IActionResult> ConvertCurrency(decimal amount, string from, string to)
        {
            string apiKey = "d7810a5636b180fd85e84469"; // ✅ Ensure correct API Key
            string url = $"https://v6.exchangerate-api.com/v6/{apiKey}/latest/{from}";

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                return BadRequest("Failed to fetch exchange rates.");
            }

            var data = JObject.Parse(await response.Content.ReadAsStringAsync());

            // Check if the requested currency exists
            if (!data["conversion_rates"].HasValues || data["conversion_rates"][to] == null)
            {
                return BadRequest("Invalid currency code.");
            }

            decimal rate = data["conversion_rates"][to].Value<decimal>();
            decimal convertedAmount = amount * rate;

            return Ok(new { original = amount, converted = convertedAmount, currency = to, rate = rate });
        }
    }
}
