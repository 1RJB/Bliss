namespace Bliss.Models
{
    public class UserDTO
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Role { get; set; } = "client";

        public int RewardPoints { get; set; }
    }
}
