using Porteo.Models.Common;
using Porteo.Models.Consultants;

namespace Porteo.Models.Productions
{
    /// <summary>Demande d'absence / congé d'un consultant.</summary>
    public class Absence : BaseEntity
    {
        public int ConsultantId { get; set; }
        public Consultant Consultant { get; set; }

        /// <summary>conge_paye | rtt | maladie | sans_solde</summary>
        public string Type { get; set; } = AbsenceType.CongePaye;
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public decimal NbJours { get; set; }
        public string Motif { get; set; }
        /// <summary>demande | approuve | refuse</summary>
        public string Statut { get; set; } = AbsenceStatut.Demande;
    }

    public static class AbsenceType
    {
        public const string CongePaye = "conge_paye";
        public const string Rtt = "rtt";
        public const string Maladie = "maladie";
        public const string SansSolde = "sans_solde";
        public static readonly string[] All = { CongePaye, Rtt, Maladie, SansSolde };
    }

    public static class AbsenceStatut
    {
        public const string Demande = "demande";
        public const string Approuve = "approuve";
        public const string Refuse = "refuse";
        public static readonly string[] All = { Demande, Approuve, Refuse };
    }
}
