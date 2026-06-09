using System.ComponentModel.DataAnnotations;

namespace Porteo.ModelViews.Configurations
{
    public class GlobalParameterDto
    {
        public int Id { get; set; }
        public string Cle { get; set; }
        public string Libelle { get; set; }
        public string Valeur { get; set; }
        public string Groupe { get; set; }
    }

    public class AgencyProfileDto
    {
        public int Id { get; set; }
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

    /// <summary>Entrée du simulateur de rémunération en portage.</summary>
    public class SimulationRequest
    {
        [Range(1, double.MaxValue)] public decimal Tjm { get; set; }
        [Range(1, 31)] public int JoursParMois { get; set; } = 18;
        /// <summary>Optionnels : si non fournis, on utilise les paramètres globaux.</summary>
        public decimal? FraisGestionPct { get; set; }
        public decimal? ChargesSalarialesPct { get; set; }
        public decimal? ChargesPatronalesPct { get; set; }
    }

    public class SimulationResult
    {
        public decimal Facturable { get; set; }
        public decimal FraisGestion { get; set; }
        public decimal CoutEmployeur { get; set; }
        public decimal ChargesPatronales { get; set; }
        public decimal Brut { get; set; }
        public decimal ChargesSalariales { get; set; }
        public decimal Net { get; set; }
        public decimal FraisGestionPct { get; set; }
        public decimal ChargesSalarialesPct { get; set; }
        public decimal ChargesPatronalesPct { get; set; }
    }
}
