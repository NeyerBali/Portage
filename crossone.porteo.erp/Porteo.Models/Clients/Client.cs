using Porteo.Models.Common;
using Porteo.Models.Missions;

namespace Porteo.Models.Clients
{
    /// <summary>
    /// Client (entreprise cliente) — côté « 1 » de la relation 1‑N avec Mission.
    /// </summary>
    public class Client : BaseEntity
    {
        public string RaisonSociale { get; set; }
        public string Siret { get; set; }
        public string Secteur { get; set; }
        public string Contact { get; set; }
        public string Email { get; set; }
        public string Telephone { get; set; }
        public string Adresse { get; set; }
        public string Ville { get; set; }

        // Relation 1‑N : un client possède plusieurs missions
        public ICollection<Mission> Missions { get; set; } = new List<Mission>();
    }
}
