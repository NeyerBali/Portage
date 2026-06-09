namespace Porteo.Models.Common
{
    /// <summary>
    /// Classe de base partagée par toutes les entités persistées.
    /// </summary>
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
