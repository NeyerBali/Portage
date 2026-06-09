namespace Porteo.ModelViews.Dashboard
{
    /// <summary>Indicateur clé (KPI) avec sa variation.</summary>
    public class KpiDto
    {
        public string Cle { get; set; }
        public string Libelle { get; set; }
        public decimal Valeur { get; set; }
        public decimal Delta { get; set; }
        public string Format { get; set; } = "number"; // number | currency
    }

    /// <summary>Point de la série « CA par mois ».</summary>
    public class CaMoisDto
    {
        public string Mois { get; set; }   // ex. "2026-01"
        public string Libelle { get; set; } // ex. "Janv."
        public decimal Montant { get; set; }
    }

    /// <summary>Comptage de missions par statut (donut).</summary>
    public class StatutCountDto
    {
        public string Statut { get; set; }
        public int Nombre { get; set; }
        public decimal Montant { get; set; }
    }

    /// <summary>Top client par chiffre d'affaires.</summary>
    public class TopClientDto
    {
        public int ClientId { get; set; }
        public string RaisonSociale { get; set; }
        public decimal Ca { get; set; }
        public int NombreMissions { get; set; }
    }

    /// <summary>Élément de la timeline « dernières activités ».</summary>
    public class ActiviteDto
    {
        public string Type { get; set; }
        public string Titre { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
    }

    /// <summary>Réponse complète du dashboard admin.</summary>
    public class DashboardDto
    {
        public List<KpiDto> Kpis { get; set; } = new();
        public List<CaMoisDto> CaParMois { get; set; } = new();
        public List<StatutCountDto> MissionsParStatut { get; set; } = new();
        public List<TopClientDto> TopClients { get; set; } = new();
        public List<ActiviteDto> DernieresActivites { get; set; } = new();
    }

    /// <summary>Dashboard d'un consultant (ses propres données).</summary>
    public class ConsultantDashboardDto
    {
        public List<KpiDto> Kpis { get; set; } = new();
        public List<CaMoisDto> CaParMois { get; set; } = new();
        public List<StatutCountDto> MissionsParStatut { get; set; } = new();
    }
}
