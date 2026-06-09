using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Filters;
using Porteo.Api.Helpers;
using Porteo.Models.Productions;
using Porteo.Models.Users;
using Porteo.ModelViews.Productions;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>Compte-rendu d'activité (CRA) mensuel. Consultant saisit/soumet, admin valide.</summary>
    [ApiController]
    [Route("api/cras")]
    [Authorize]
    [DataOwnershipProtectionFilter]
    public class CrasController : ControllerBase
    {
        private readonly IServices _services;
        public CrasController(IServices services) { _services = services; }

        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _services.Cras.GetAll(User.OwnerConsultantId()));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CraUpsertDto dto)
        {
            try { return Ok(await _services.Cras.Create(dto, User.OwnerConsultantId())); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("{id:int}/submit")]
        public async Task<IActionResult> Submit(int id)
        {
            var r = await _services.Cras.Submit(id, User.OwnerConsultantId());
            return r == null ? NotFound() : Ok(r);
        }

        [HttpPost("{id:int}/validate")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Validate(int id)
        {
            var r = await _services.Cras.SetStatut(id, CraStatut.Valide);
            return r == null ? NotFound() : Ok(r);
        }

        [HttpPost("{id:int}/refuse")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Refuse(int id)
        {
            var r = await _services.Cras.SetStatut(id, CraStatut.Refuse);
            return r == null ? NotFound() : Ok(r);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
            => await _services.Cras.Delete(id, User.OwnerConsultantId()) ? NoContent() : NotFound();
    }
}
