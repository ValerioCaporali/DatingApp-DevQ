using System.Security.Claims;

namespace API.Extensions
{
    public static class ClaimsPrincipleExtensions
    {
        public static string GetUsername(this ClaimsPrincipal user) // prendo lo username utilizzando il token
        {
            return user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}