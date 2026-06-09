using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        public ConsultantsController(IServices services)
        {
            _services = services;
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
