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
    }
}
