using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class IPGeolocationService
{
    private readonly HttpClient _httpClient;

    public IPGeolocationService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<Geolocation> GetGeolocation(string ipAddress)
    {
        var response = await _httpClient.GetStringAsync($"http://ip-api.com/json/{ipAddress}");
        return JsonConvert.DeserializeObject<Geolocation>(response);
    }
}

public class Geolocation
{
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}