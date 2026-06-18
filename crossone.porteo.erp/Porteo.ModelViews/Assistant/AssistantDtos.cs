using System.ComponentModel.DataAnnotations;

namespace Porteo.ModelViews.Assistant
{
    public class AssistantQuestionDto
    {
        [Required(ErrorMessage = "La question est requise.")]
        public string Question { get; set; }
    }
}
