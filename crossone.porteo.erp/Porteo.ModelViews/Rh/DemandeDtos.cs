using System.ComponentModel.DataAnnotations;

namespace Porteo.ModelViews.Rh
{
    public class DemandeDto
    {
        public int Id { get; set; }
        public int ConsultantId { get; set; }
        public string ConsultantNom { get; set; }
        public string Type { get; set; }
        public string Objet { get; set; }
        public decimal? Montant { get; set; }
        public string Description { get; set; }
        public string Statut { get; set; }
        public string Reponse { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class DemandeUpsertDto
    {
        [Required] public string Type { get; set; }
        [Required(ErrorMessage = "L'objet est requis.")] public string Objet { get; set; }
        public decimal? Montant { get; set; }
        public string Description { get; set; }
    }

    public class DemandeReponseDto
    {
        public string Statut { get; set; }   // traitee | refusee
        public string Reponse { get; set; }
    }
}
