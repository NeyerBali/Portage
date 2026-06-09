using Porteo.Models.Common;

namespace Porteo.Models.Configurations
{
    /// <summary>Paramètre global de l'application (taux, pourcentages…).</summary>
    public class GlobalParameter : BaseEntity
    {
        public string Cle { get; set; }
        public string Libelle { get; set; }
        public string Valeur { get; set; }
        public string Groupe { get; set; }
    }

    public static class ParamKeys
    {
        public const string TauxTva = "taux_tva";                 // %
        public const string FraisGestion = "frais_gestion";       // %
        public const string ChargesSalariales = "charges_salariales"; // %
        public const string ChargesPatronales = "charges_patronales"; // %
    }
}
