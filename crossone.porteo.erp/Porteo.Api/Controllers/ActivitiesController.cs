using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Helpers;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>Journal d'activité (audit léger des actions clés).</summary>
    [ApiController]
    [Route("api/activities")]
    [Authorize]
    public class ActivitiesController : ControllerBase
    {
        private readonly IServices _services;
        public ActivitiesController(IServices services) { _services = services; }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            // Admin : tout le journal ; consultant : ses propres actions.
            var owner = User.OwnerConsultantId();
            return Ok(await _services.Activities.GetRecent(60, owner));
        }
    }
}
