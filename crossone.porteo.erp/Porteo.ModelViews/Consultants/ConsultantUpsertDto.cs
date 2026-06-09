using System.ComponentModel.DataAnnotations;

namespace Porteo.ModelViews.Consultants
{
    /// <summary>DTO d'entrée pour la création / l'édition d'un consultant.</summary>
    public class ConsultantUpsertDto
    {
        [Required(ErrorMessage = "Le nom est requis.")]
        public string Nom { get; set; }

        [Required(ErrorMessage = "Le prénom est requis.")]
        public string Prenom { get; set; }

        [Required(ErrorMessage = "L'email est requis.")]
        [EmailAddress(ErrorMessage = "Format d'email invalide.")]
        public string Email { get; set; }

        public string Telephone { get; set; }

        [Required(ErrorMessage = "La spécialité (métier) est requise.")]
        public string Specialite { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Le TJM doit être supérieur à 0.")]
        public decimal Tjm { get; set; }

        [Required(ErrorMessage = "La ville est requise.")]
        public string Ville { get; set; }

        public string Competences { get; set; }
        public string Statut { get; set; } = "active";
    }
}
