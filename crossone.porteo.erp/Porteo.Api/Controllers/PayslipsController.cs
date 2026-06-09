using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Filters;
using Porteo.Api.Helpers;
using Porteo.Models.Users;
using Porteo.ModelViews.Monitorings;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>Bulletins de paie. L'admin génère à partir des CRA validés ; le consultant consulte les siens.</summary>
    [ApiController]
    [Route("api/payslips")]
    [Authorize]
    [DataOwnershipProtectionFilter]
    public class PayslipsController : ControllerBase
    {
        private readonly IServices _services;
        public PayslipsController(IServices services) { _services = services; }

        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _services.Payslips.GetAll(User.OwnerConsultantId()));

        [HttpPost("generate")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Generate([FromBody] GeneratePayslipDto dto)
        {
            try
            {
                var p = await _services.Payslips.Generate(dto.ConsultantId, dto.Mois);
                await _services.Activities.Log("payslip_generated", "Bulletin généré", $"{p.ConsultantNom} · {p.Mois}", User.GetUserId(), User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value);
                return Ok(p);
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Delete(int id)
            => await _services.Payslips.Delete(id) ? NoContent() : NotFound();
    }
}
