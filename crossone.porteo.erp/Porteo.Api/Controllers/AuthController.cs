using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Helpers;
using Porteo.ModelViews.Users;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IServices _services;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IServices services, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _services = services;
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>Authentifie un utilisateur et renvoie un JWT.</summary>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResultDto>> Login([FromBody] LoginDto request)
        {
            var user = await _services.Users.Authenticate(request.Email, request.Password);
            if (user == null)
            {
                _logger.LogInformation("Échec de connexion pour {Email}", request.Email);
                return BadRequest(new { message = "Email ou mot de passe incorrect." });
            }

            var secret = _configuration.GetSection("AppSettings:Token").Value;
            var token = _services.Users.CreateToken(user, secret);

            return Ok(new AuthResultDto
            {
                Token = token.Token,
                FullName = $"{user.Prenom} {user.Nom}".Trim(),
                Email = user.Email,
                Role = user.Role,
                ConsultantId = user.ConsultantId,
                ExpiresAt = token.ExpiresAt
            });
        }

        /// <summary>Profil de l'utilisateur connecté.</summary>
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<MeDto>> Me()
        {
            var me = await _services.Users.GetMe(User.GetUserId());
            return me == null ? NotFound() : Ok(me);
        }
    }
}
