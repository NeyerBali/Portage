using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Helpers;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>Recherche globale (missions, clients, consultants).</summary>
    [ApiController]
    [Route("api/search")]
    [Authorize]
    public class SearchController : ControllerBase
    {
        private readonly IServices _services;
        public SearchController(IServices services) { _services = services; }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string q)
            => Ok(await _services.Search.Search(q, User.IsAdmin(), User.GetConsultantId()));
    }
}
