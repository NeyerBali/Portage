using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Filters;
using Porteo.Api.Helpers;
using Porteo.Models.Users;
using Porteo.ModelViews.Missions;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>CRUD complet des missions (table principale). Filtre d'appartenance pour les consultants.</summary>
    [ApiController]
    [Route("api/missions")]
    [Authorize]
    [DataOwnershipProtectionFilter]
    public class MissionsController : ControllerBase
    {
        private readonly IServices _services;

        public MissionsController(IServices services)
        {
            _services = services;
        }

        /// <summary>Liste paginée + filtres + tri. Un consultant ne voit que ses missions.</summary>
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] MissionQueryParams query)
        {
            var result = await _services.Missions.GetPaged(query, User.OwnerConsultantId());
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var mission = await _services.Missions.GetDetail(id, User.OwnerConsultantId());
            return mission == null ? NotFound() : Ok(mission);
        }

        /// <summary>Création — réservée à l'administrateur (cf. règles de rôle).</summary>
        [HttpPost]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Create([FromBody] MissionUpsertDto dto)
        {
            try
            {
                var created = await _services.Missions.CreateMission(dto);
                await _services.Activities.Log("mission_created", "Mission créée", $"{created.Titre} · {created.ClientNom}", User.GetUserId(), User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>Édition — l'admin édite tout, un consultant uniquement ses missions.</summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] MissionUpsertDto dto)
        {
            try
            {
                var updated = await _services.Missions.UpdateMission(id, dto, User.OwnerConsultantId());
                return updated == null ? NotFound() : Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _services.Missions.DeleteMission(id, User.OwnerConsultantId());
            return ok ? NoContent() : NotFound();
        }
    }
}
