using Newtonsoft.Json;


namespace Bliss.Models
{

    public class IPGeolocationService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<IPGeolocationService> _logger;

        public IPGeolocationService(HttpClient httpClient, ILogger<IPGeolocationService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<Geolocation> GetGeolocation(string ipAddress)
        {
            // Check if the IP address is a local address
            if (ipAddress == "::1" || ipAddress == "127.0.0.1")
            {
                // Return a default geolocation for local addresses
                return new Geolocation
                {
                    City = "Localhost",
                    Country = "Localhost",
                    Latitude = 0.0,
                    Longitude = 0.0
                };
            }

            var response = await _httpClient.GetStringAsync($"http://ip-api.com/json/{ipAddress}");
            _logger.LogInformation($"Geolocation response: {response}");

            var apiResponse = JsonConvert.DeserializeObject<IpApiResponse>(response);

            if (apiResponse == null || apiResponse.Status != "success")
            {
                _logger.LogError($"Failed to parse geolocation response for IP {ipAddress}");
                return new Geolocation
                {
                    City = "Unknown",
                    Country = "Unknown",
                    Latitude = 0.0,
                    Longitude = 0.0
                };
            }

            return new Geolocation
            {
                City = apiResponse.City,
                Country = apiResponse.Country,
                Latitude = apiResponse.Lat,
                Longitude = apiResponse.Lon
            };
        }
    }

    public class Geolocation
    {
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class IpApiResponse
    {
        public string Query { get; set; }
        public string Status { get; set; }
        public string Country { get; set; }
        public string CountryCode { get; set; }
        public string Region { get; set; }
        public string RegionName { get; set; }
        public string City { get; set; }
        public string Zip { get; set; }
        public double Lat { get; set; }
        public double Lon { get; set; }
        public string Timezone { get; set; }
        public string Isp { get; set; }
        public string Org { get; set; }
        public string As { get; set; }
    }
}