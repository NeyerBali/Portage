using Porteo.Models.Common;
using Porteo.Models.Consultants;
using Porteo.Models.Missions;

namespace Porteo.Models.Justificatifs
{
    /// <summary>
    /// Justificatif déposé par un consultant pour une mission (note de frais,
    /// CRA, document…). Le fichier est stocké directement en base (bytea),
    /// sans service de stockage externe.
    /// </summary>
    public class Justificatif : BaseEntity
    {
        public string Libelle { get; set; }
        /// <summary>frais | cra | document | autre</summary>
        public string Type { get; set; } = JustificatifType.Frais;
        public decimal? Montant { get; set; }
        public DateTime DateJustificatif { get; set; }
        public string Notes { get; set; }

        /// <summary>en_attente | valide | refuse</summary>
        public string Statut { get; set; } = JustificatifStatut.EnAttente;
        public string MotifRefus { get; set; }
        public DateTime? DateTraitement { get; set; }

        // Fichier (stocké en base)
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public byte[] Data { get; set; }

        public int MissionId { get; set; }
        public Mission Mission { get; set; }

        public int ConsultantId { get; set; }
        public Consultant Consultant { get; set; }
    }
}
