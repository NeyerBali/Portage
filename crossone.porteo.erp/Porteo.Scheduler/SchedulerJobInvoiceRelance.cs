using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Porteo.Models.Factures;
using Porteo.Repositories;
using Quartz;

namespace Porteo.Scheduler
{
    /// <summary>
    /// Job Quartz : relance des factures impayées (statut « émise » dont
    /// l'échéance est dépassée). Journalise la relance (équivalent d'un envoi mail).
    /// </summary>
    [DisallowConcurrentExecution]
    public class SchedulerJobInvoiceRelance : IJob
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SchedulerJobInvoiceRelance> _logger;

        public SchedulerJobInvoiceRelance(IServiceScopeFactory scopeFactory, ILogger<SchedulerJobInvoiceRelance> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            using var scope = _scopeFactory.CreateScope();
            var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var now = DateTime.UtcNow;
            var enRetard = await uow.Factures.QueryWithRelations()
                .Where(f => f.Statut == FactureStatut.Emise && f.DateEcheance < now)
                .ToListAsync();

            if (enRetard.Count == 0)
            {
                _logger.LogInformation("[Relance factures] Aucune facture impayée en retard à {Date:u}.", now);
                return;
            }

            _logger.LogWarning("[Relance factures] {Count} facture(s) impayée(s) en retard.", enRetard.Count);
            foreach (var f in enRetard)
            {
                _logger.LogWarning(
                    "[Relance] Facture {Numero} — client {Client} — {Montant:0.00} € TTC — échéance {Echeance:dd/MM/yyyy} dépassée.",
                    f.Numero, f.Mission?.Client?.RaisonSociale ?? "?", f.MontantTTC, f.DateEcheance);
            }
        }
    }
}
