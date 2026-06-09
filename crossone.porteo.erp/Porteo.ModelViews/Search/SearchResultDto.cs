namespace Porteo.ModelViews.Search
{
    /// <summary>Résultat de la recherche globale.</summary>
    public class SearchResultDto
    {
        /// <summary>mission | client | consultant | facture</summary>
        public string Type { get; set; }
        public int Id { get; set; }
        public string Titre { get; set; }
        public string SousTitre { get; set; }
        public string Route { get; set; }
    }
}
