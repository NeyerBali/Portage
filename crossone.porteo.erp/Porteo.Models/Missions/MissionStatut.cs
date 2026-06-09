namespace Porteo.Models.Missions
{
    /// <summary>
    /// Statuts possibles d'une mission (valeurs persistées telles quelles).
    /// </summary>
    public static class MissionStatut
    {
        public const string Brouillon = "brouillon";
        public const string EnCours = "en_cours";
        public const string Terminee = "terminee";
        public const string Facturee = "facturee";
        public const string Annulee = "annulee";

        public static readonly string[] All =
        {
            Brouillon, EnCours, Terminee, Facturee, Annulee
        };
    }
}
