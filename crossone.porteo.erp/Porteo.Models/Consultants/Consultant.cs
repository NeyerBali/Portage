using Porteo.Models.Common;
using Porteo.Models.Missions;

namespace Porteo.Models.Consultants
{
    /// <summary>
    /// Consultant porté — côté « 1 » de la relation 1‑N avec Mission.
    /// </summary>
    public class Consultant : BaseEntity
    {
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string Email { get; set; }
        public string Telephone { get; set; }
        public string Specialite { get; set; }
        public decimal Tjm { get; set; }
        public string Ville { get; set; }
        /// <summary>Compétences séparées par des virgules (ex. "Angular, .NET, SQL").</summary>
        public string Competences { get; set; }
        /// <summary>active | paused</summary>
        public string Statut { get; set; } = "active";

        public ICollection<Mission> Missions { get; set; } = new List<Mission>();
    }
}
