using Microsoft.Extensions.DependencyInjection;
using Quartz;

namespace Porteo.Scheduler
{
    public static class SchedulerExtensions
    {
        /// <summary>
        /// Enregistre Quartz et planifie le job de relance des factures impayées.
        /// Cron par défaut : tous les jours à 08:00 (modifiable via Scheduler:RelanceCron).
        /// </summary>
        public static IServiceCollection AddSchedulerInfrastructure(this IServiceCollection services, string relanceCron = null)
        {
            var cron = string.IsNullOrWhiteSpace(relanceCron) ? "0 0 8 * * ?" : relanceCron;

            services.AddQuartz(q =>
            {
                var jobKey = new JobKey(nameof(SchedulerJobInvoiceRelance));
                q.AddJob<SchedulerJobInvoiceRelance>(opts => opts.WithIdentity(jobKey));
                q.AddTrigger(t => t
                    .ForJob(jobKey)
                    .WithIdentity($"{nameof(SchedulerJobInvoiceRelance)}-trigger")
                    .WithCronSchedule(cron));
            });

            services.AddQuartzHostedService(opts => opts.WaitForJobsToComplete = true);
            return services;
        }
    }
}
