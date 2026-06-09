namespace Porteo.ModelViews.Activities
{
    public class ActivityDto
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string Titre { get; set; }
        public string Description { get; set; }
        public string UserName { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
