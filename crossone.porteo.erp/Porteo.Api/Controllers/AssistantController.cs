using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Models.Users;
using Porteo.ModelViews.Assistant;
using Porteo.Services.Assistant;

namespace Porteo.Api.Controllers
{
    /// <summary>Assistant IA (Groq) — réservé à l'administrateur.</summary>
    [ApiController]
    [Route("api/assistant")]
    [Authorize(Roles = UserRole.Admin)]
    public class AssistantController : ControllerBase
    {
        private readonly IAssistantService _assistant;
        private readonly ILogger<AssistantController> _logger;

        public AssistantController(IAssistantService assistant, ILogger<AssistantController> logger)
        {
            _assistant = assistant;
            _logger = logger;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] AssistantQuestionDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto?.Question))
                return BadRequest(new { message = "Question vide." });
            try
            {
                var answer = await _assistant.Ask(dto.Question);
                return Ok(new { answer });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Assistant IA en échec");
                return StatusCode(500, new { message = "L'assistant est momentanément indisponible.", detail = ex.Message });
            }
        }

        /// <summary>Réponse en flux (mot-à-mot) — texte brut envoyé au fil de l'eau.</summary>
        [HttpPost("ask-stream")]
        public async Task AskStream([FromBody] AssistantQuestionDto dto, CancellationToken ct)
        {
            Response.ContentType = "text/plain; charset=utf-8";
            Response.Headers["X-Accel-Buffering"] = "no";  // pas de tampon côté proxy
            Response.Headers.CacheControl = "no-cache";
            if (string.IsNullOrWhiteSpace(dto?.Question)) { await Response.WriteAsync("Question vide.", ct); return; }
            try
            {
                await foreach (var token in _assistant.AskStream(dto.Question, ct))
                {
                    await Response.WriteAsync(token, ct);
                    await Response.Body.FlushAsync(ct);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Streaming IA en échec");
                await Response.WriteAsync("\n⚠️ Flux interrompu.", ct);
            }
        }

        /// <summary>Résumé IA d'une mission.</summary>
        [HttpPost("mission-summary/{id:int}")]
        public async Task<IActionResult> MissionSummary(int id)
        {
            try { return Ok(new { summary = await _assistant.SummarizeMission(id) }); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Résumé mission IA en échec");
                return StatusCode(500, new { message = "Résumé indisponible.", detail = ex.Message });
            }
        }
    }
}
