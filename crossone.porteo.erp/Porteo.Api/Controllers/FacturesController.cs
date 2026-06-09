using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Filters;
using Porteo.Api.Helpers;
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
            return updated == null ? NotFound() : Ok(updated);
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
