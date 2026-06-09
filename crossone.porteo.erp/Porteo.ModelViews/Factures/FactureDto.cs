namespace Porteo.ModelViews.Factures
{
    /// <summary>Facture renvoyée par l'API (liste / détail).</summary>
    public class FactureDto
    {
        public int Id { get; set; }
        public string Numero { get; set; }
        public decimal MontantHT { get; set; }
        public decimal Tva { get; set; }
        public decimal MontantTTC { get; set; }
        public string Statut { get; set; }
        public DateTime DateEmission { get; set; }
        public DateTime DateEcheance { get; set; }

        public int MissionId { get; set; }
        public string MissionTitre { get; set; }
        public int ClientId { get; set; }
        public string ClientNom { get; set; }
    }
}
