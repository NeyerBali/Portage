namespace Porteo.ModelViews.Alerts
{
    public class AlertItemDto
    {
        public string Titre { get; set; }
        public string SousTitre { get; set; }
        public string Meta { get; set; }
        /// <summary>Route Angular de destination (ex. /factures/12).</summary>
        public string Route { get; set; }
    }

    public class AlertCategoryDto
    {
        public string Cle { get; set; }
        public string Titre { get; set; }
        public string Hint { get; set; }
        /// <summary>danger | warn | info | neutral</summary>
        public string Tone { get; set; }
        public string Icon { get; set; }
        public int Count { get; set; }
        public List<AlertItemDto> Items { get; set; } = new();
    }
}
