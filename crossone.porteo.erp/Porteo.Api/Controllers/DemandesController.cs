using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Filters;
using Porteo.Api.Helpers;
using Porteo.Models.Users;
using Porteo.ModelViews.Rh;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>Demandes RH (acompte, attestation…). Consultant crée, admin répond.</summary>
    [ApiController]
    [Route("api/demandes")]
    [Authorize]
    [DataOwnershipProtectionFilter]
    public class DemandesController : ControllerBase
    {
        private readonly IServices _services;
        public DemandesController(IServices services) { _services = services; }

        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _services.Demandes.GetAll(User.OwnerConsultantId()));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DemandeUpsertDto dto)
        {
            var consultantId = User.GetConsultantId();
            if (consultantId == null) return BadRequest(new { message = "Action réservée aux consultants." });
            return Ok(await _services.Demandes.Create(dto, consultantId.Value));
        }

        [HttpPost("{id:int}/repondre")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Repondre(int id, [FromBody] DemandeReponseDto dto)
        {
            var r = await _services.Demandes.Repondre(id, dto);
            return r == null ? NotFound() : Ok(r);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
            => await _services.Demandes.Delete(id, User.OwnerConsultantId()) ? NoContent() : NotFound();
    }
}
