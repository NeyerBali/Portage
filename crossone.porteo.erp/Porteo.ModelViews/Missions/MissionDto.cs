namespace Porteo.ModelViews.Missions
{
    /// <summary>Représentation d'une mission renvoyée par l'API (lecture).</summary>
    public class MissionDto
    {
        public int Id { get; set; }
        public string Titre { get; set; }
        public string Description { get; set; }
        public string Statut { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public decimal Tjm { get; set; }
        public int Jours { get; set; }
        public decimal Montant { get; set; }

        public int ClientId { get; set; }
        public string ClientNom { get; set; }

        public int ConsultantId { get; set; }
        public string ConsultantNom { get; set; }

        public int NombreFactures { get; set; }
    }

    /// <summary>Fiche détaillée d'une mission (en-tête + factures + coordonnées liées).</summary>
    public class MissionDetailDto : MissionDto
    {
        public string ClientSecteur { get; set; }
        public string ConsultantSpecialite { get; set; }
        public string ConsultantVille { get; set; }
        public List<Porteo.ModelViews.Factures.FactureDto> Factures { get; set; } = new();
    }
}
