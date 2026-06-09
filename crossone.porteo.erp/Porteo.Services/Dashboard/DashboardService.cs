using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Porteo.Dapper.Dashboard;
using Porteo.Models.Missions;
using Porteo.ModelViews.Dashboard;
using Porteo.Repositories;

namespace Porteo.Services.Dashboard
{
    public interface IDashboardService
    {
        Task<DashboardDto> GetAdminDashboard();
        Task<ConsultantDashboardDto> GetConsultantDashboard(int consultantId);
    }

    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _uow;
        private readonly IDashboardQueries _queries;

        public DashboardService(IUnitOfWork uow, IDashboardQueries queries)
        {
            _uow = uow;
            _queries = queries;
        }

        public async Task<DashboardDto> GetAdminDashboard()
        {
            var dto = new DashboardDto
            {
                CaParMois = await GetCaParMois(null),
                MissionsParStatut = (await _uow.Missions.ReadAsync<StatutCountDto>(_queries.MissionsParStatut(null))).ToList(),
                TopClients = (await _uow.Missions.ReadAsync<TopClientDto>(_queries.TopClients())).ToList(),
                DernieresActivites = await GetActivites(null),
            };
            dto.Kpis = await BuildKpis(null);
            return dto;
        }

        public async Task<ConsultantDashboardDto> GetConsultantDashboard(int consultantId)
        {
            return new ConsultantDashboardDto
            {
                Kpis = await BuildKpis(consultantId),
                CaParMois = await GetCaParMois(consultantId),
                MissionsParStatut = (await _uow.Missions.ReadAsync<StatutCountDto>(_queries.MissionsParStatut(consultantId))).ToList(),
            };
        }

        private async Task<List<KpiDto>> BuildKpis(int? consultantId)
        {
            var rows = await _uow.Missions.ReadAsync<KpiAggregateRow>(_queries.Kpis(consultantId));
            var agg = rows.FirstOrDefault() ?? new KpiAggregateRow();

            return new List<KpiDto>
            {
                new() { Cle = "ca", Libelle = consultantId.HasValue ? "Mon CA" : "CA total", Valeur = agg.CaTotal, Delta = 0, Format = "currency" },
                new() { Cle = "missions", Libelle = consultantId.HasValue ? "Missions en cours" : "Missions actives", Valeur = agg.MissionsActives, Delta = 0, Format = "number" },
                new() { Cle = "consultants", Libelle = "Consultants", Valeur = agg.Consultants, Delta = 0, Format = "number" },
                new() { Cle = "impayees", Libelle = "Factures impayées", Valeur = agg.FacturesImpayees, Delta = 0, Format = "number" },
            };
        }

        /// <summary>Construit une série de 12 mois (avec zéros) à partir des données Dapper.</summary>
        private async Task<List<CaMoisDto>> GetCaParMois(int? consultantId)
        {
            var raw = (await _uow.Missions.ReadAsync<CaMoisDto>(_queries.CaParMois(consultantId)))
                .ToDictionary(x => x.Mois, x => x.Montant);

            var fr = new CultureInfo("fr-FR");
            var result = new List<CaMoisDto>();
            var start = DateTime.UtcNow.AddMonths(-11);
            for (int i = 0; i < 12; i++)
            {
                var d = new DateTime(start.Year, start.Month, 1).AddMonths(i);
                var key = d.ToString("yyyy-MM");
                result.Add(new CaMoisDto
                {
                    Mois = key,
                    Libelle = fr.DateTimeFormat.GetAbbreviatedMonthName(d.Month),
                    Montant = raw.TryGetValue(key, out var m) ? m : 0m
                });
            }
            return result;
        }

        private async Task<List<ActiviteDto>> GetActivites(int? consultantId)
        {
            var query = _uow.Missions.QueryWithRelations();
            if (consultantId.HasValue)
                query = query.Where(m => m.ConsultantId == consultantId.Value);

            var recent = await query
                .OrderByDescending(m => m.CreatedAt)
                .Take(6)
                .ToListAsync();

            return recent.Select(m => new ActiviteDto
            {
                Type = m.Statut,
                Titre = m.Titre,
                Description = $"{m.Client?.RaisonSociale} · {(m.Statut == MissionStatut.EnCours ? "En cours" : m.Statut)}",
                Date = m.CreatedAt
            }).ToList();
        }
    }
}
