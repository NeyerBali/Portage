using System.ComponentModel.DataAnnotations;

namespace Porteo.ModelViews.Justificatifs
{
    /// <summary>Justificatif renvoyé par l'API (sans le contenu binaire).</summary>
    public class JustificatifDto
    {
        public int Id { get; set; }
        public string Libelle { get; set; }
        public string Type { get; set; }
        public decimal? Montant { get; set; }
        public DateTime DateJustificatif { get; set; }
        public string Notes { get; set; }
        public string Statut { get; set; }
        public string MotifRefus { get; set; }
        public DateTime? DateTraitement { get; set; }
        public string FileName { get; set; }
        public bool HasFile { get; set; }
        public DateTime CreatedAt { get; set; }

        public int MissionId { get; set; }
        public string MissionTitre { get; set; }
        public int ConsultantId { get; set; }
        public string ConsultantNom { get; set; }
        public string ClientNom { get; set; }
    }

    /// <summary>Données de création (multipart/form-data ; le fichier arrive à part).</summary>
    public class JustificatifCreateForm
    {
        [Range(1, int.MaxValue, ErrorMessage = "La mission est requise.")]
        public int MissionId { get; set; }
        [Required(ErrorMessage = "Le type est requis.")]
        public string Type { get; set; }
        [Required(ErrorMessage = "Le libellé est requis.")]
        public string Libelle { get; set; }
        public decimal? Montant { get; set; }
        public DateTime DateJustificatif { get; set; }
        public string Notes { get; set; }
    }

    public class RejectJustificatifDto
    {
        public string Motif { get; set; }
    }
}
