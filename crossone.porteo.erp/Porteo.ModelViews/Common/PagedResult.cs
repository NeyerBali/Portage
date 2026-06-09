namespace Porteo.ModelViews.Common
{
    /// <summary>Résultat paginé générique renvoyé par les listes.</summary>
    public class PagedResult<T>
    {
        public IEnumerable<T> Items { get; set; } = new List<T>();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(Total / (double)PageSize) : 0;

        public PagedResult() { }

        public PagedResult(IEnumerable<T> items, int total, int page, int pageSize)
        {
            Items = items;
            Total = total;
            Page = page;
            PageSize = pageSize;
        }
    }
}
