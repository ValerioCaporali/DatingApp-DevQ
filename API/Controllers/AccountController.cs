using Microsoft.AspNetCore.Mvc;
using API.Data;
using System.Threading.Tasks;
using API.Entities;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using API.DTOs;
using API.Interfaces;
using System.Linq;
using AutoMapper;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {

        private readonly DataContext _context;
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;

        public AccountController(DataContext context, ITokenService tokenService, IMapper mapper)
        {
            _context = context;
            _tokenService = tokenService;
            _mapper = mapper;
        }

        [HttpPost("register")]
        // invece di restituire l'utente restituisco un Dto che contiene lo username e il token
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto){ // cosi i parametri nella registrazione li passo nel body della richiesta 
            
            using var hmac = new HMACSHA512(); // classe che uso per fare l'hash della password

            if(await UserExist(registerDto.Username)) return BadRequest("Username is taken"); // controllo se l'username esiste

            var user = _mapper.Map<AppUser>(registerDto);

            user.UserName = registerDto.Username.ToLower();
            user.passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password));
            user.passwordSalt = hmac.Key;

            _context.Users.Add(user); // agguingo solamente l'entità
            await _context.SaveChangesAsync(); // qui salvo l'entità nella tabella del databse

            return new UserDto
            {
                Username = user.UserName,
                Token = _tokenService.CreateToken(user),
                KnownAs = user.KnowAs,
                Gender = user.Gender
            };
        }

        [HttpPost("login")]
        // invece di restituire l'utente restituisco un Dto che contiene username e token
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto) // cosi i parametri durante il login li prendo dal body della richiesta
        {
            var user = await _context.Users
            .Include(p => p.Photos)
            .SingleOrDefaultAsync(x => x.UserName == loginDto.Username); // cerco una corrispondenza e prendo l'utente per quello username
            
            if(user == null) return Unauthorized("Invalid username"); // se non trovo una corrispondenza con quell'username allora ritorno "non autorizzato"
            
            using var hmac = new HMACSHA512(user.passwordSalt);

            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password)); // faccio l'hash della password inserita durante il login

            // controllo che la password inserita durante il login sia uguale a quella nel database

            for(int i = 0; i < computedHash.Length; i++)
            {
                if(computedHash[i] != user.passwordHash[i]) return Unauthorized("Invalid Password");
            }

            return new UserDto
            {
                Username = user.UserName,
                Token = _tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url,
                KnownAs = user.KnowAs,
                Gender = user.Gender
            };

            
        }

        private async Task<bool> UserExist(string username)
        {
            return await _context.Users.AnyAsync(x => x.UserName == username.ToLower());
        }

    }
}