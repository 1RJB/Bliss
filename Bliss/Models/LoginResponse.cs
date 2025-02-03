namespace Bliss.Models
{
    public class LoginResponse
    {
        public UserDTO User { get; set; } = new UserDTO();

        public string AccessToken { get; set; } = string.Empty;
    }
}
