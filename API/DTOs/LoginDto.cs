using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class LoginDto
    {
        [Required] // this parameter in DTOs is required 
        public string Username { get; set; }

        [Required]
        public string Password { get; set; }
    }
}