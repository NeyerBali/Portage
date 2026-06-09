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
    /// <summary>Demandes d'absence / congés. Consultant demande, admin approuve.</summary>
    [ApiController]
    [Route("api/absences")]
    [Authorize]
    [DataOwnershipProtectionFilter]
    public class AbsencesController : ControllerBase
    {
        private readonly IServices _services;
        public AbsencesController(IServices services) { _services = services; }

        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _services.Absences.GetAll(User.OwnerConsultantId()));

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AbsenceUpsertDto dto)
        {
            var consultantId = User.GetConsultantId();
            if (consultantId == null) return BadRequest(new { message = "Action réservée aux consultants." });
            try { return Ok(await _services.Absences.Create(dto, consultantId.Value)); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("{id:int}/approve")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Approve(int id)
        {
            var r = await _services.Absences.SetStatut(id, AbsenceStatut.Approuve);
            return r == null ? NotFound() : Ok(r);
        }

        [HttpPost("{id:int}/refuse")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Refuse(int id)
        {
            var r = await _services.Absences.SetStatut(id, AbsenceStatut.Refuse);
            return r == null ? NotFound() : Ok(r);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
            => await _services.Absences.Delete(id, User.OwnerConsultantId()) ? NoContent() : NotFound();
    }
}
