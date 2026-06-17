using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Porteo.Dapper.Dashboard;
using Porteo.Models.Justificatifs;
using Porteo.Models.Missions;
using Porteo.Models.Productions;
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
            var series = (await _uow.Missions.ReadAsync<MonthlySeriesRow>(_queries.MonthlySeries(consultantId))).ToList();

            var ca = series.Select(s => s.CaHt).ToList();
            var miss = series.Select(s => (decimal)s.MissionsCreees).ToList();
            var fact = series.Select(s => (decimal)s.FacturesEmises).ToList();

            var caDelta = PercentDelta(ca);
            var missDelta = IntDelta(miss);
            var factDelta = IntDelta(fact);

            var caKpi = new KpiDto { Cle = "ca", Libelle = consultantId.HasValue ? "Mon CA cumulé" : "Chiffre d'affaires", Valeur = agg.CaTotal, Format = "currency", Tone = "brand", Sparkline = ca, DeltaLabel = caDelta.label, DeltaDir = caDelta.dir };
            var missionsKpi = new KpiDto { Cle = "missions", Libelle = consultantId.HasValue ? "Mes missions en cours" : "Missions actives", Valeur = agg.MissionsActives, Format = "number", Tone = "info", Sparkline = miss, DeltaLabel = missDelta.label, DeltaDir = missDelta.dir };

            // ---- Vue CONSULTANT : KPIs personnels (jamais le total « Consultants ») ----
            if (consultantId.HasValue)
            {
                var mois = DateTime.UtcNow.ToString("yyyy-MM");
                var joursMois = (await _uow.Cras.Find(c => c.ConsultantId == consultantId.Value && c.Mois == mois)).Sum(c => c.JoursTravailles);
                var justifEnAttente = (await _uow.Justificatifs.Find(j => j.ConsultantId == consultantId.Value && j.Statut == JustificatifStatut.EnAttente)).Count();
                return new List<KpiDto>
                {
                    caKpi,
                    missionsKpi,
                    new() { Cle = "jours", Libelle = "Jours saisis (ce mois)", Valeur = joursMois, Format = "number", Tone = "success", Sparkline = Flat(joursMois) },
                    new() { Cle = "justif", Libelle = "Justificatifs en attente", Valeur = justifEnAttente, Format = "number", Tone = "warn", Sparkline = Flat(justifEnAttente) },
                };
            }

            // ---- Vue ADMINISTRATEUR : vue globale ----
            return new List<KpiDto>
            {
                caKpi,
                missionsKpi,
                new() { Cle = "consultants", Libelle = "Consultants", Valeur = agg.Consultants, Format = "number", Tone = "warn", Sparkline = Flat(agg.Consultants) },
                // Pour les impayées, une hausse est défavorable → direction "down" (rouge).
                new() { Cle = "impayees", Libelle = "Factures impayées", Valeur = agg.FacturesImpayees, Format = "number", Tone = "error", Sparkline = fact,
                        DeltaLabel = factDelta.label == null ? null : factDelta.label + " retards", DeltaDir = factDelta.dir == "up" ? "down" : (factDelta.dir == "down" ? "up" : "none") },
            };
        }

        private static (string label, string dir) PercentDelta(IReadOnlyList<decimal> s)
        {
            if (s.Count < 2) return (null, "none");
            decimal prev = s[s.Count - 2], last = s[s.Count - 1];
            if (prev == 0) return last > 0 ? ("+100 %", "up") : (null, "none");
            var pct = Math.Round((last - prev) / prev * 100m, 1);
            if (pct == 0) return (null, "none");
            var label = (pct > 0 ? "+" : "") + pct.ToString("0.#", new CultureInfo("fr-FR")) + " %";
            return (label, pct > 0 ? "up" : "down");
        }

        private static (string label, string dir) IntDelta(IReadOnlyList<decimal> s)
        {
            if (s.Count < 2) return (null, "none");
            var diff = (int)(s[s.Count - 1] - s[s.Count - 2]);
            if (diff == 0) return (null, "none");
            return ((diff > 0 ? "+" : "") + diff, diff > 0 ? "up" : "down");
        }

        private static List<decimal> Flat(decimal v) => Enumerable.Repeat(v, 8).ToList();

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
