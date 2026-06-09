namespace Porteo.ModelViews.Missions
{
    /// <summary>Filtres + tri + pagination de la liste des missions.</summary>
    public class MissionQueryParams
    {
        public string Search { get; set; }
        public string Statut { get; set; }
        public int? ClientId { get; set; }
        public int? ConsultantId { get; set; }
        public DateTime? DebutApres { get; set; }
        public DateTime? DebutAvant { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 8;
        /// <summary>titre | client | consultant | debut | statut | montant</summary>
        public string SortBy { get; set; } = "debut";
        /// <summary>asc | desc</summary>
        public string SortDir { get; set; } = "desc";
    }
}
