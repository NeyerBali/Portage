using Porteo.ModelViews.Missions;

namespace Porteo.ModelViews.Consultants
{
    /// <summary>Consultant renvoyé par l'API (liste / fiche).</summary>
    public class ConsultantDto
    {
        public int Id { get; set; }
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string Email { get; set; }
        public string Telephone { get; set; }
        public string Specialite { get; set; }
        public decimal Tjm { get; set; }
        public string Ville { get; set; }
        public string Competences { get; set; }
        public string Statut { get; set; }

        public int NombreMissions { get; set; }
        public int MissionsActives { get; set; }
        public decimal CaCumule { get; set; }
    }

    /// <summary>Fiche consultant détaillée avec ses missions assignées.</summary>
    public class ConsultantDetailDto : ConsultantDto
    {
        public IEnumerable<MissionDto> Missions { get; set; } = new List<MissionDto>();
    }
}
