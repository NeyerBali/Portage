using Porteo.Models.Common;
using Porteo.Models.Consultants;
using Porteo.Models.Missions;

namespace Porteo.Models.Productions
{
    /// <summary>Compte-rendu d'activité mensuel d'un consultant sur une mission.</summary>
    public class Cra : BaseEntity
    {
        public int MissionId { get; set; }
        public Mission Mission { get; set; }
        public int ConsultantId { get; set; }
        public Consultant Consultant { get; set; }

        /// <summary>Mois au format AAAA-MM.</summary>
        public string Mois { get; set; }
        public int JoursTravailles { get; set; }
        public int JoursAbsence { get; set; }
        public string Commentaire { get; set; }
        /// <summary>brouillon | soumis | valide | refuse</summary>
        public string Statut { get; set; } = CraStatut.Brouillon;
    }

    public static class CraStatut
    {
        public const string Brouillon = "brouillon";
        public const string Soumis = "soumis";
        public const string Valide = "valide";
        public const string Refuse = "refuse";
        public static readonly string[] All = { Brouillon, Soumis, Valide, Refuse };
    }
}
