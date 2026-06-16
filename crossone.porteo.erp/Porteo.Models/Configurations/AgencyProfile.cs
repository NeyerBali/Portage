using Porteo.Models.Common;

namespace Porteo.Models.Configurations
{
    /// <summary>Profil de l'agence de portage (enregistrement unique).</summary>
    public class AgencyProfile : BaseEntity
    {
        public string RaisonSociale { get; set; }
        public string Siret { get; set; }
        public string TvaIntra { get; set; }
        public string Adresse { get; set; }
        public string Ville { get; set; }
        public string Email { get; set; }
        public string Telephone { get; set; }
        public string SiteWeb { get; set; }
        public string Iban { get; set; }

        /// <summary>Logo de l'agence (data URI base64) — affiché sur les factures et l'app.</summary>
        public string Logo { get; set; }
        /// <summary>Signature/cachet (data URI base64) — affiché sur toutes les factures PDF.</summary>
        public string Signature { get; set; }
    }
}
