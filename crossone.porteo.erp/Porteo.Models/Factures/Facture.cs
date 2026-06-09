using Porteo.Models.Common;
using Porteo.Models.Missions;

namespace Porteo.Models.Factures
{
    /// <summary>
    /// Facture rattachée à une mission (côté « N » de Mission 1‑N Facture).
    /// </summary>
    public class Facture : BaseEntity
    {
        public string Numero { get; set; }
        public decimal MontantHT { get; set; }
        public decimal Tva { get; set; }
        public decimal MontantTTC { get; set; }
        /// <summary>Voir <see cref="FactureStatut"/>.</summary>
        public string Statut { get; set; } = FactureStatut.Brouillon;
        public DateTime DateEmission { get; set; }
        public DateTime DateEcheance { get; set; }

        public int MissionId { get; set; }
        public Mission Mission { get; set; }
    }
}
