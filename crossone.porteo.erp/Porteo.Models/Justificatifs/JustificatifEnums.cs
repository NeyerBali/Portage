namespace Porteo.Models.Justificatifs
{
    public static class JustificatifStatut
    {
        public const string EnAttente = "en_attente";
        public const string Valide = "valide";
        public const string Refuse = "refuse";
        public static readonly string[] All = { EnAttente, Valide, Refuse };
    }

    public static class JustificatifType
    {
        public const string Frais = "frais";
        public const string Cra = "cra";
        public const string Document = "document";
        public const string Autre = "autre";
        public static readonly string[] All = { Frais, Cra, Document, Autre };
    }
}
