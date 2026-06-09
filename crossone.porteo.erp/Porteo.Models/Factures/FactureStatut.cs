namespace Porteo.Models.Factures
{
    /// <summary>
    /// Statuts possibles d'une facture (valeurs persistées telles quelles).
    /// </summary>
    public static class FactureStatut
    {
        public const string Brouillon = "brouillon";
        public const string Emise = "emise";
        public const string Payee = "payee";

        public static readonly string[] All = { Brouillon, Emise, Payee };
    }
}
