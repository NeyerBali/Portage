using System.ComponentModel.DataAnnotations.Schema;
using Porteo.Models.Clients;
using Porteo.Models.Common;
using Porteo.Models.Consultants;
using Porteo.Models.Factures;

namespace Porteo.Models.Missions
{
    /// <summary>
    /// Mission de portage — table CRUD principale. Relie 1 Client et 1 Consultant,
    /// et possède N Factures.
    /// </summary>
    public class Mission : BaseEntity
    {
        public string Titre { get; set; }
        public string Description { get; set; }
        /// <summary>Voir <see cref="MissionStatut"/>.</summary>
        public string Statut { get; set; } = MissionStatut.Brouillon;
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public decimal Tjm { get; set; }
        public int Jours { get; set; }

        // Relation N‑1 vers Client
        public int ClientId { get; set; }
        public Client Client { get; set; }

        // Relation N‑1 vers Consultant
        public int ConsultantId { get; set; }
        public Consultant Consultant { get; set; }

        // Relation 1‑N vers Factures
        public ICollection<Facture> Factures { get; set; } = new List<Facture>();

        /// <summary>Montant total = TJM × Jours (non persisté).</summary>
        [NotMapped]
        public decimal Montant => Tjm * Jours;
    }
}
