using Porteo.ModelViews.Missions;

namespace Porteo.ModelViews.Clients
{
    /// <summary>Client renvoyé par l'API (liste / fiche).</summary>
    public class ClientDto
    {
        public int Id { get; set; }
        public string RaisonSociale { get; set; }
        public string Siret { get; set; }
        public string Secteur { get; set; }
        public string Contact { get; set; }
        public string Email { get; set; }
        public string Telephone { get; set; }
        public string Adresse { get; set; }
        public string Ville { get; set; }

        // Agrégats relation 1‑N
        public int NombreMissions { get; set; }
        public int MissionsActives { get; set; }
        public decimal CaCumule { get; set; }
        public decimal EncoursImpaye { get; set; }
    }

    /// <summary>Fiche client détaillée : visualise la relation 1‑N (ses missions).</summary>
    public class ClientDetailDto : ClientDto
    {
        public IEnumerable<MissionDto> Missions { get; set; } = new List<MissionDto>();
    }
}
