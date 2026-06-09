using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Helpers;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>Centre d'alerte : alertes catégorisées calculées à partir des données.</summary>
    [ApiController]
    [Route("api/alerts")]
    [Authorize]
    public class AlertsController : ControllerBase
    {
        private readonly IServices _services;
        public AlertsController(IServices services) { _services = services; }

        [HttpGet]
        public async Task<IActionResult> Get()
            => Ok(await _services.Alerts.GetAlerts(User.IsAdmin(), User.GetConsultantId()));
    }
}
