using System.ComponentModel.DataAnnotations;

namespace Porteo.ModelViews.Missions
{
    /// <summary>DTO d'entrée pour la création / l'édition d'une mission.</summary>
    public class MissionUpsertDto
    {
        [Required(ErrorMessage = "L'intitulé est requis.")]
        public string Titre { get; set; }

        public string Description { get; set; }

        [Required]
        public string Statut { get; set; }

        [Required(ErrorMessage = "La date de début est requise.")]
        public DateTime DateDebut { get; set; }

        [Required(ErrorMessage = "La date de fin est requise.")]
        public DateTime DateFin { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Le TJM doit être supérieur à 0.")]
        public decimal Tjm { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Le nombre de jours doit être supérieur à 0.")]
        public int Jours { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Le client est requis.")]
        public int ClientId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Le consultant est requis.")]
        public int ConsultantId { get; set; }
    }
}
