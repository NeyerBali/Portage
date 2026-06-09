using Porteo.Models.Common;
using Porteo.Models.Consultants;

namespace Porteo.Models.Rh
{
    /// <summary>Demande RH d'un consultant (acompte, attestation, autre) traitée par l'admin.</summary>
    public class Demande : BaseEntity
    {
        public int ConsultantId { get; set; }
        public Consultant Consultant { get; set; }

        /// <summary>acompte | attestation | materiel | autre</summary>
        public string Type { get; set; } = DemandeType.Autre;
        public string Objet { get; set; }
        public decimal? Montant { get; set; }
        public string Description { get; set; }
        /// <summary>ouverte | traitee | refusee</summary>
        public string Statut { get; set; } = DemandeStatut.Ouverte;
        public string Reponse { get; set; }
    }

    public static class DemandeType
    {
        public const string Acompte = "acompte";
        public const string Attestation = "attestation";
        public const string Materiel = "materiel";
        public const string Autre = "autre";
        public static readonly string[] All = { Acompte, Attestation, Materiel, Autre };
    }

    public static class DemandeStatut
    {
        public const string Ouverte = "ouverte";
        public const string Traitee = "traitee";
        public const string Refusee = "refusee";
        public static readonly string[] All = { Ouverte, Traitee, Refusee };
    }
}
