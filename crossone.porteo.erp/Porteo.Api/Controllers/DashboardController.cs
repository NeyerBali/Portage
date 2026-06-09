using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Helpers;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>Dashboards : KPIs, séries CA/mois, missions par statut, top clients.</summary>
    [ApiController]
    [Route("api/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IServices _services;

        public DashboardController(IServices services)
        {
            _services = services;
        }

        /// <summary>Dashboard adapté au rôle : vue globale (admin) ou vue « mes données » (consultant).</summary>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            if (User.IsAdmin())
                return Ok(await _services.Dashboard.GetAdminDashboard());

            var consultantId = User.GetConsultantId();
            if (consultantId == null) return Forbid();
            return Ok(await _services.Dashboard.GetConsultantDashboard(consultantId.Value));
        }

        /// <summary>Dashboard administrateur explicite (vue globale).</summary>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Admin() => Ok(await _services.Dashboard.GetAdminDashboard());
    }
}
