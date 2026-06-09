using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Helpers;
using Porteo.Models.Users;
using Porteo.ModelViews.Consultants;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>Gestion des consultants (réservée à l'administrateur).</summary>
    [ApiController]
    [Route("api/consultants")]
    [Authorize(Roles = UserRole.Admin)]
    public class ConsultantsController : ControllerBase
    {
        private readonly IServices _services;
        private readonly IConfiguration _configuration;
        private readonly ILogger<ConsultantsController> _logger;

        public ConsultantsController(IServices services, IConfiguration configuration, ILogger<ConsultantsController> logger)
        {
            _services = services;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _services.Consultants.GetAll());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var consultant = await _services.Consultants.GetDetail(id);
            return consultant == null ? NotFound() : Ok(consultant);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ConsultantUpsertDto dto)
        {
            var created = await _services.Consultants.CreateConsultant(dto);

            // Crée un compte utilisateur + envoie l'email de bienvenue (définition du mot de passe).
            try
            {
                var user = await _services.Users.CreateConsultantAccount(created.Id, created.Prenom, created.Nom, created.Email);
                if (user != null)
                {
                    var token = await _services.Users.CreateResetToken(user, 48);
                    var front = (_configuration["App:FrontUrl"] ?? "http://localhost:4200").TrimEnd('/');
                    _services.Mail.SendWelcomeConsultant($"{created.Prenom} {created.Nom}", created.Email, $"{front}/auth/reset?token={token}");
                    await _services.Activities.Log("consultant_invited", "Consultant invité", $"{created.Prenom} {created.Nom} · {created.Email}", User.GetUserId(), User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Email de bienvenue consultant échoué pour {Email}", created.Email);
            }

            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ConsultantUpsertDto dto)
        {
            var updated = await _services.Consultants.UpdateConsultant(id, dto);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var ok = await _services.Consultants.DeleteConsultant(id);
                return ok ? NoContent() : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
