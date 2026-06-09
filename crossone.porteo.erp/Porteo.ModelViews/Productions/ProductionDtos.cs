using System.ComponentModel.DataAnnotations;

namespace Porteo.ModelViews.Productions
{
    public class CraDto
    {
        public int Id { get; set; }
        public int MissionId { get; set; }
        public string MissionTitre { get; set; }
        public int ConsultantId { get; set; }
        public string ConsultantNom { get; set; }
        public string Mois { get; set; }
        public int JoursTravailles { get; set; }
        public int JoursAbsence { get; set; }
        public string Commentaire { get; set; }
        public string Statut { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CraUpsertDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "La mission est requise.")]
        public int MissionId { get; set; }
        [Required(ErrorMessage = "Le mois est requis.")]
        public string Mois { get; set; }
        [Range(0, 31)] public int JoursTravailles { get; set; }
        [Range(0, 31)] public int JoursAbsence { get; set; }
        public string Commentaire { get; set; }
    }

    public class AbsenceDto
    {
        public int Id { get; set; }
        public int ConsultantId { get; set; }
        public string ConsultantNom { get; set; }
        public string Type { get; set; }
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public decimal NbJours { get; set; }
        public string Motif { get; set; }
        public string Statut { get; set; }
    }

    public class AbsenceUpsertDto
    {
        [Required] public string Type { get; set; }
        [Required] public DateTime DateDebut { get; set; }
        [Required] public DateTime DateFin { get; set; }
        public string Motif { get; set; }
    }
}
