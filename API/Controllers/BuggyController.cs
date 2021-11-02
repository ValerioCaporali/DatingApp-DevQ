using System;
using System.Net;
using API.Data;
using API.Entities;
using API.Middleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class BuggyController : BaseApiController
    {
        private DataContext _context;
        
        public BuggyController(DataContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("auth")]
        public ActionResult<string> GetSecret()
        {
            return "secret text";
        }

        [HttpGet("not-found")]
        public ActionResult<AppUser> GetNotFound()
        {
            var thing = _context.Users.Find(-1); // cerco qualcosa che sono sicuro di non trovare (non esiste un utente con id -1)
            if(thing == null) return NotFound();
            return Ok(thing);
        }

        [HttpGet("server-error")]
        public ActionResult<string> GetServerError()
        {
                
            var thing = _context.Users.Find(-1); 
            
            var thingToReturn = thing.ToString(); // il metodo find se non trova una corrispondenza restituisce null, quindi provo ad eseguire un metodo su qualcosa che è nullo e ottengo un eccezione

            return thingToReturn;
        }

        [HttpGet("bad-request")]
        public ActionResult GetBadRequest()
        {
            return BadRequest();
        }
    }
}