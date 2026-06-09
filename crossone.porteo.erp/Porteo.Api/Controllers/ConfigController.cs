using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Models.Users;
using Porteo.ModelViews.Configurations;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>Paramètres globaux, profil agence et simulateur de rémunération.</summary>
    [ApiController]
    [Route("api/config")]
    [Authorize]
    public class ConfigController : ControllerBase
    {
        private readonly IServices _services;
        public ConfigController(IServices services) { _services = services; }

        [HttpGet("parameters")]
        public async Task<IActionResult> Parameters() => Ok(await _services.Config.GetParameters());

        [HttpPut("parameters/{cle}")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> UpdateParameter(string cle, [FromBody] GlobalParameterDto dto)
        {
            var r = await _services.Config.UpdateParameter(cle, dto?.Valeur);
            return r == null ? NotFound() : Ok(r);
        }

        [HttpGet("agency")]
        public async Task<IActionResult> Agency() => Ok(await _services.Config.GetAgency());

        [HttpPut("agency")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> UpdateAgency([FromBody] AgencyProfileDto dto)
            => Ok(await _services.Config.UpdateAgency(dto));

        [HttpPost("simulate")]
        public async Task<IActionResult> Simulate([FromBody] SimulationRequest req)
            => Ok(await _services.Config.Simulate(req));
    }
}
