using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using API.Errors;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace API.Middleware
{
    public class ExceptionMiddleware
    {

        private readonly RequestDelegate _next;
        // private readonly ILogger<ExceptionMiddleware> _logger;
        private readonly ILogger<ExceptionMiddleware> _logger;
        // private readonly IHostEnvironment _env;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            // _env = env;
            _logger = logger;
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IHostEnvironment env)
        {
            try
            {
                await _next(context);
            }
            catch(Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int) HttpStatusCode.InternalServerError;
                var response = env.IsDevelopment() // vedo se mi trovo nell'ambiente di sviluppo
                    ? new ApiException(context.Response.StatusCode, ex.Message, ex.StackTrace?.ToString()) // se mi trovo nell'ambiente di sviluppo
                    : new ApiException(context.Response.StatusCode, "Internal Server Error"); // se non mi trovo nell'ambiente di sviluppo

                var options = new JsonSerializerOptions{PropertyNamingPolicy = JsonNamingPolicy.CamelCase}; // mi serve per poter creare il json

                var json = JsonSerializer.Serialize(response, options); // creo il json della risposta

                await context.Response.WriteAsync(json); // mando la risposta
            }
        } 
    }
}