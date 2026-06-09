using System.ComponentModel.DataAnnotations;

namespace Porteo.ModelViews.Factures
{
    /// <summary>DTO d'entrée pour la création / l'édition d'une facture.</summary>
    public class FactureUpsertDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "La mission est requise.")]
        public int MissionId { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Le montant HT doit être supérieur à 0.")]
        public decimal MontantHT { get; set; }

        /// <summary>Taux de TVA en pourcentage (ex. 20).</summary>
        public decimal TauxTva { get; set; } = 20m;

        [Required(ErrorMessage = "La date d'émission est requise.")]
        public DateTime DateEmission { get; set; }

        [Required(ErrorMessage = "La date d'échéance est requise.")]
        public DateTime DateEcheance { get; set; }

        public string Statut { get; set; }
    }
}
