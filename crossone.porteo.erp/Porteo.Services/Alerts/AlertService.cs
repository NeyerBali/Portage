using Microsoft.EntityFrameworkCore;
using Porteo.Models.Factures;
using Porteo.Models.Justificatifs;
using Porteo.Models.Missions;
using Porteo.ModelViews.Alerts;
using Porteo.Repositories;

namespace Porteo.Services.Alerts
{
    public interface IAlertService
    {
        Task<IEnumerable<AlertCategoryDto>> GetAlerts(bool isAdmin, int? consultantId);
    }

    public class AlertService : IAlertService
    {
        private readonly IUnitOfWork _uow;
        public AlertService(IUnitOfWork uow) { _uow = uow; }

        public async Task<IEnumerable<AlertCategoryDto>> GetAlerts(bool isAdmin, int? consultantId)
        {
            var now = DateTime.UtcNow;
            var cats = new List<AlertCategoryDto>();

            // Périmètre : un consultant ne voit que ses données.
            var factQ = _uow.Factures.QueryWithRelations();
            var missQ = _uow.Missions.QueryWithRelations();
            var justQ = _uow.Justificatifs.QueryWithRelations();
            if (!isAdmin && consultantId.HasValue)
            {
                factQ = factQ.Where(f => f.Mission.ConsultantId == consultantId.Value);
                missQ = missQ.Where(m => m.ConsultantId == consultantId.Value);
                justQ = justQ.Where(j => j.ConsultantId == consultantId.Value);
            }

            var factures = await factQ.ToListAsync();
            var missions = await missQ.ToListAsync();
            var justifs = await justQ.ToListAsync();

            // 1) Factures en retard
            var retard = factures.Where(f => f.Statut == FactureStatut.Emise && f.DateEcheance < now)
                .OrderBy(f => f.DateEcheance).ToList();
            cats.Add(new AlertCategoryDto
            {
                Cle = "factures_retard", Titre = "Factures en retard", Tone = "danger", Icon = "invoice",
                Hint = "Échéance dépassée, non payées", Count = retard.Count,
                Items = retard.Select(f => new AlertItemDto
                {
                    Titre = f.Numero, SousTitre = f.Mission?.Client?.RaisonSociale,
                    Meta = $"échéance {f.DateEcheance:dd/MM/yyyy} · {f.MontantTTC:0} €", Route = $"/factures/{f.Id}"
                }).ToList()
            });

            // 2) Factures à échoir sous 7 jours
            var echoir = factures.Where(f => f.Statut == FactureStatut.Emise && f.DateEcheance >= now && f.DateEcheance <= now.AddDays(7))
                .OrderBy(f => f.DateEcheance).ToList();
            cats.Add(new AlertCategoryDto
            {
                Cle = "factures_echoir", Titre = "Factures à échoir", Tone = "warn", Icon = "wallet",
                Hint = "Échéance dans les 7 jours", Count = echoir.Count,
                Items = echoir.Select(f => new AlertItemDto
                {
                    Titre = f.Numero, SousTitre = f.Mission?.Client?.RaisonSociale,
                    Meta = $"échéance {f.DateEcheance:dd/MM/yyyy}", Route = $"/factures/{f.Id}"
                }).ToList()
            });

            // 3) Missions se terminant bientôt
            var finProche = missions.Where(m => m.Statut == MissionStatut.EnCours && m.DateFin >= now && m.DateFin <= now.AddDays(30))
                .OrderBy(m => m.DateFin).ToList();
            cats.Add(new AlertCategoryDto
            {
                Cle = "missions_fin", Titre = "Missions se terminant bientôt", Tone = "info", Icon = "briefcase",
                Hint = "Fin prévue sous 30 jours", Count = finProche.Count,
                Items = finProche.Select(m => new AlertItemDto
                {
                    Titre = m.Titre, SousTitre = m.Client?.RaisonSociale,
                    Meta = $"fin {m.DateFin:dd/MM/yyyy}", Route = $"/missions/{m.Id}"
                }).ToList()
            });

            // 4) Justificatifs en attente
            var attente = justifs.Where(j => j.Statut == JustificatifStatut.EnAttente)
                .OrderBy(j => j.CreatedAt).ToList();
            cats.Add(new AlertCategoryDto
            {
                Cle = "justifs_attente", Titre = isAdmin ? "Justificatifs à traiter" : "Mes justificatifs en attente", Tone = "warn", Icon = "file",
                Hint = isAdmin ? "En attente de validation" : "En cours de traitement", Count = attente.Count,
                Items = attente.Select(j => new AlertItemDto
                {
                    Titre = j.Libelle, SousTitre = j.Consultant != null ? $"{j.Consultant.Prenom} {j.Consultant.Nom}" : null,
                    Meta = $"{j.Type} · {j.CreatedAt:dd/MM/yyyy}", Route = "/justificatifs"
                }).ToList()
            });

            return cats;
        }
    }
}
