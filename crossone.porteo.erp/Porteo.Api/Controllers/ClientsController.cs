using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Models.Users;
using Porteo.ModelViews.Clients;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>Gestion des clients (réservée à l'administrateur). Fiche détail = relation 1‑N.</summary>
    [ApiController]
    [Route("api/clients")]
    [Authorize(Roles = UserRole.Admin)]
    public class ClientsController : ControllerBase
    {
        private readonly IServices _services;

        public ClientsController(IServices services)
        {
            _services = services;
        }

        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _services.Clients.GetAll());

        /// <summary>Fiche client avec la liste de SES missions (relation 1‑N visualisée).</summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var client = await _services.Clients.GetDetail(id);
            return client == null ? NotFound() : Ok(client);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ClientUpsertDto dto)
        {
            var created = await _services.Clients.CreateClient(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ClientUpsertDto dto)
        {
            var updated = await _services.Clients.UpdateClient(id, dto);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var ok = await _services.Clients.DeleteClient(id);
                return ok ? NoContent() : NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
