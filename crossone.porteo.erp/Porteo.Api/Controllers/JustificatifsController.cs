using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Filters;
using Porteo.Api.Helpers;
using Porteo.Models.Users;
using Porteo.ModelViews.Justificatifs;
using Porteo.Services;

namespace Porteo.Api.Controllers
{
    /// <summary>
    /// Justificatifs : un consultant dépose des pièces (note de frais, CRA, document)
    /// sur ses missions ; l'administrateur les valide ou les refuse.
    /// </summary>
    [ApiController]
    [Route("api/justificatifs")]
    [Authorize]
    [DataOwnershipProtectionFilter]
    public class JustificatifsController : ControllerBase
    {
        private readonly IServices _services;
        public JustificatifsController(IServices services) { _services = services; }

        [HttpGet]
        public async Task<IActionResult> Get()
            => Ok(await _services.Justificatifs.GetAll(User.OwnerConsultantId()));

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var j = await _services.Justificatifs.GetDto(id, User.OwnerConsultantId());
            return j == null ? NotFound() : Ok(j);
        }

        [HttpGet("{id:int}/download")]
        public async Task<IActionResult> Download(int id)
        {
            var j = await _services.Justificatifs.GetForDownload(id, User.OwnerConsultantId());
            if (j == null) return NotFound();
            return File(j.Data, j.ContentType ?? "application/octet-stream", j.FileName ?? $"justificatif-{id}");
        }

        /// <summary>Création + upload (multipart/form-data).</summary>
        [HttpPost]
        [RequestSizeLimit(15_000_000)]
        public async Task<IActionResult> Create([FromForm] JustificatifCreateForm form, IFormFile file)
        {
            try
            {
                byte[] data = null; string fileName = null, contentType = null;
                if (file != null && file.Length > 0)
                {
                    using var ms = new MemoryStream();
                    await file.CopyToAsync(ms);
                    data = ms.ToArray();
                    fileName = file.FileName;
                    contentType = file.ContentType;
                }
                var created = await _services.Justificatifs.Create(
                    form, data, fileName, contentType, User.OwnerConsultantId(), User.GetUserId(), User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id:int}/validate")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Validate(int id)
        {
            var j = await _services.Justificatifs.Validate(id, User.GetUserId(), User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value);
            return j == null ? NotFound() : Ok(j);
        }

        [HttpPost("{id:int}/reject")]
        [Authorize(Roles = UserRole.Admin)]
        public async Task<IActionResult> Reject(int id, [FromBody] RejectJustificatifDto dto)
        {
            var j = await _services.Justificatifs.Reject(id, dto?.Motif, User.GetUserId(), User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value);
            return j == null ? NotFound() : Ok(j);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _services.Justificatifs.Delete(id, User.OwnerConsultantId());
            return ok ? NoContent() : NotFound();
        }
    }
}
