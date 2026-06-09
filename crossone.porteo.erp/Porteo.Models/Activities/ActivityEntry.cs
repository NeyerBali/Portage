using Porteo.Models.Common;

namespace Porteo.Models.Activities
{
    /// <summary>
    /// Entrée du journal d'activité (audit léger) : trace les actions clés
    /// (création de mission/facture, relance, dépôt/validation de justificatif…).
    /// </summary>
    public class ActivityEntry : BaseEntity
    {
        /// <summary>mission_created | facture_created | facture_paid | facture_relance | justif_created | justif_validated | justif_rejected</summary>
        public string Type { get; set; }
        public string Titre { get; set; }
        public string Description { get; set; }
        public int? UserId { get; set; }
        public string UserName { get; set; }
        /// <summary>Pour filtrer le journal d'un consultant sur ses propres actions.</summary>
        public int? ConsultantId { get; set; }
    }
}
