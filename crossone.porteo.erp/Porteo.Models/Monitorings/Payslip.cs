using Porteo.Models.Common;
using Porteo.Models.Consultants;

namespace Porteo.Models.Monitorings
{
    /// <summary>Bulletin de paie d'un consultant pour un mois (calculé à partir du CRA et des paramètres).</summary>
    public class Payslip : BaseEntity
    {
        public int ConsultantId { get; set; }
        public Consultant Consultant { get; set; }

        public string Mois { get; set; } // AAAA-MM
        public int JoursTravailles { get; set; }
        public decimal Facturable { get; set; }
        public decimal FraisGestion { get; set; }
        public decimal Brut { get; set; }
        public decimal ChargesSalariales { get; set; }
        public decimal ChargesPatronales { get; set; }
        public decimal Net { get; set; }
        /// <summary>brouillon | emis</summary>
        public string Statut { get; set; } = "emis";
    }
}
