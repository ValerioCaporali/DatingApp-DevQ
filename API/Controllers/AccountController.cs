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
using Microsoft.AspNetCore.Identity;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {

        private readonly DataContext _context;
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;

        public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, ITokenService tokenService, IMapper mapper)
        {
            _signInManager = signInManager;
            _userManager = userManager;
            _tokenService = tokenService;
            _mapper = mapper;
        }

        [HttpPost("register")]
        // invece di restituire l'utente restituisco un Dto che contiene lo username e il token
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto){ // cosi i parametri nella registrazione li passo nel body della richiesta 

            if(await UserExist(registerDto.Username)) return BadRequest("Username is taken"); // controllo se l'username esiste

            var user = _mapper.Map<AppUser>(registerDto);

            user.UserName = registerDto.Username.ToLower();

            var result = await _userManager.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded) return BadRequest(result.Errors);

            var roleResult = await _userManager.AddToRoleAsync(user, "Member");

            if (!roleResult.Succeeded) return BadRequest(result.Errors);

            return new UserDto
            {
                Username = user.UserName,
                Token = await _tokenService.CreateToken(user),
                KnownAs = user.KnowAs,
                Gender = user.Gender
            };
        }

        [HttpPost("login")]
        // invece di restituire l'utente restituisco un Dto che contiene username e token
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto) // cosi i parametri durante il login li prendo dal body della richiesta
        {
            var user = await _userManager.Users
            .Include(p => p.Photos)
            .SingleOrDefaultAsync(x => x.UserName == loginDto.Username.ToLower()); // cerco una corrispondenza e prendo l'utente per quello username
            
            if(user == null) return Unauthorized("Invalid username"); // se non trovo una corrispondenza con quell'username allora ritorno "non autorizzato"

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

            return new UserDto
            {
                Username = user.UserName,
                Token = await _tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url,
                KnownAs = user.KnowAs,
                Gender = user.Gender
            };

            
        }

        private async Task<bool> UserExist(string username)
        {
            return await _userManager.Users.AnyAsync(x => x.UserName == username.ToLower());
        }

    }
}