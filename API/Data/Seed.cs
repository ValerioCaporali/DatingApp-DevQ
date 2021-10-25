using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class Seed
    {
        public static async Task SeedUsers(DataContext context)
        {
            if (await context.Users.AnyAsync()) return;

            var userData = await System.IO.File.ReadAllTextAsync("Data/UserSeedData.json");
            var users = JsonSerializer.Deserialize<List<AppUser>>(userData); // dal json faccio un elenco di utenti di tipo AppUser
            foreach(var user in users)
            {
                using var hmac = new HMACSHA512(); // per ogni utente ho bisogno della password hash e salt
                user.UserName = user.UserName.ToLower();
                user.passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes("Pa$$w0rd"));
                user.passwordSalt = hmac.Key;

                context.Users.Add(user);
                
                context.SaveChanges();
            }
        }
    }
}