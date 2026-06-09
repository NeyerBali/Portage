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
    }
}
