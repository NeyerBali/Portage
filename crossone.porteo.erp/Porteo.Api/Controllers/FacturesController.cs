using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Filters;
using Porteo.Api.Helpers;
using System.Security.Claims;
using Porteo.Models.Users;
using Porteo.ModelViews.Factures;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>Gestion des factures. Un consultant ne voit que les factures de ses missions.</summary>
    [ApiController]
    [Route("api/factures")]
    [Authorize]
    [DataOwnershipProtectionFilter]
    public class FacturesController : ControllerBase
    {
        private readonly IServices _services;

        public FacturesController(IServices services)
        {
            _services = services;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
            => Ok(await _services.Factures.GetAll(User.OwnerConsultantId()));

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var facture = await _services.Factures.GetDto(id, User.OwnerConsultantId());
            return facture == null ? NotFound() : Ok(facture);
        }

        [HttpPost]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Create([FromBody] FactureUpsertDto dto)
        {
            try
            {
                var created = await _services.Factures.CreateFacture(dto);
                await _services.Activities.Log("facture_created", "Facture créée", $"{created.Numero} · {created.ClientNom}", User.GetUserId(), User.FindFirst(ClaimTypes.Name)?.Value);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Update(int id, [FromBody] FactureUpsertDto dto)
        {
            try
            {
                var updated = await _services.Factures.UpdateFacture(id, dto);
                return updated == null ? NotFound() : Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id:int}/mark-paid")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> MarkPaid(int id)
        {
            var updated = await _services.Factures.MarkPaid(id);
            if (updated == null) return NotFound();
            await _services.Activities.Log("facture_paid", "Facture payée", $"{updated.Numero} · {updated.ClientNom}", User.GetUserId(), User.FindFirst(ClaimTypes.Name)?.Value);
            return Ok(updated);
        }

        /// <summary>Relance manuelle d'une facture impayée (émise).</summary>
        [HttpPost("{id:int}/relance")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Relance(int id)
        {
            var facture = await _services.Factures.GetDto(id, null);
            if (facture == null) return NotFound();
            if (facture.Statut != "emise")
                return BadRequest(new { message = "Seules les factures émises peuvent être relancées." });
            await _services.Activities.Log("facture_relance", "Relance envoyée", $"{facture.Numero} · {facture.ClientNom}", User.GetUserId(), User.FindFirst(ClaimTypes.Name)?.Value);
            return Ok(new { message = $"Relance envoyée pour la facture {facture.Numero}." });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _services.Factures.DeleteFacture(id);
            return ok ? NoContent() : NotFound();
        }
    }
}
